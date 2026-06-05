import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'

const partnerSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.email('E-mail inválido'),
  whatsapp: z.string().min(1, 'WhatsApp é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  estado: z.string().length(2, 'Estado é obrigatório'),
  origem: z.string().default('Site Prado Calçados'),
  turnstileToken: z.string().optional(),
})

// In-memory rate limiting
const rateLimit = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW = 60_000

function getRateLimitInfo(ip: string) {
  const now = Date.now()
  const entry = rateLimit.get(ip)

  if (!entry || now > entry.resetAt) {
    const newEntry = { count: 1, resetAt: now + RATE_LIMIT_WINDOW }
    rateLimit.set(ip, newEntry)
    return { remaining: RATE_LIMIT_MAX - 1, resetAt: newEntry.resetAt }
  }

  entry.count++
  return { remaining: Math.max(0, RATE_LIMIT_MAX - entry.count), resetAt: entry.resetAt }
}

// Clean up stale entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60_000
let cleanupTimer: ReturnType<typeof setInterval> | null = null

function startCleanup() {
  if (cleanupTimer) return
  cleanupTimer = setInterval(() => {
    const now = Date.now()
    for (const [key, val] of rateLimit) {
      if (now > val.resetAt) rateLimit.delete(key)
    }
  }, CLEANUP_INTERVAL)
  if (cleanupTimer && typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
    cleanupTimer.unref()
  }
}

startCleanup()

export async function POST(request: Request) {
  try {
    // --- Rate limiting ---
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    const { remaining } = getRateLimitInfo(ip)
    if (remaining <= 0) {
      return NextResponse.json(
        { error: 'Muitas solicitações. Tente novamente em alguns minutos.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }

    // --- Parse body ---
    const body = await request.json()

    // --- Cloudflare Turnstile validation ---
    const turnstileToken = body.turnstileToken
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY

    if (turnstileSecret) {
      if (!turnstileToken) {
        return NextResponse.json(
          { error: 'Verificação anti-spam é obrigatória.' },
          { status: 400 }
        )
      }

      const turnstileRes = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: turnstileSecret,
            response: turnstileToken,
            remoteip: ip,
          }),
        }
      )
      const turnstileData = await turnstileRes.json()

      if (!turnstileData.success) {
        return NextResponse.json(
          { error: 'Verificação anti-spam falhou. Tente novamente.' },
          { status: 400 }
        )
      }
    }

    // --- Zod validation ---
    const parsed = partnerSchema.safeParse(body)
    if (!parsed.success) {
      const errors = parsed.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }))
      return NextResponse.json(
        { error: 'Dados inválidos', errors },
        { status: 400 }
      )
    }

    const { turnstileToken: _, ...data } = parsed.data
    const cidade_estado = `${data.cidade}/${data.estado}`

    // --- Insert into Supabase ---
    const supabase = createAdminClient()
    if (!supabase) {
      console.error('Supabase admin client não disponível')
      return NextResponse.json(
        { error: 'Erro interno. Tente novamente mais tarde.' },
        { status: 500 }
      )
    }

    const { error: insertError } = await supabase.from('parceiros').insert({
      nome: data.nome,
      email: data.email,
      whatsapp: data.whatsapp,
      cidade_estado,
      origem: data.origem,
    })

    if (insertError) {
      console.error('Erro ao inserir lead no Supabase:', insertError)
      return NextResponse.json(
        { error: 'Erro ao salvar dados. Tente novamente.' },
        { status: 500 }
      )
    }

    // --- Send email via Resend ---
    const resendApiKey = process.env.RESEND_API_KEY
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey)
        await resend.emails.send({
          from:
            process.env.RESEND_FROM_EMAIL || 'contato@mail.pradocalcados.com.br',
          to: 'comercial@pradocalcados.com.br',
          subject: '🚨 Novo parceiro interessado',
          text: `Nome: ${data.nome}
E-mail: ${data.email}
Whatsapp: ${data.whatsapp}
Cidade/Estado: ${cidade_estado}
Origem: ${data.origem}
Data: ${new Date().toLocaleString('pt-BR')}`,
        })
      } catch (emailError) {
        console.error('Erro ao enviar e-mail via Resend:', emailError)
        // Non-blocking: don't fail the request if e-mail fails
      }
    }

    return NextResponse.json(
      {
        message:
          'Recebemos sua solicitação. Nossa equipe comercial entrará em contato em breve.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro inesperado no formulário de parceiros:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}
