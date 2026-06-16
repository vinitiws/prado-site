import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'

const sacSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  documento: z.string().min(3, 'CPF/CNPJ é obrigatório'),
  email: z.string().email('E-mail inválido'),
  telefone: z.string().optional().default(''),
  tipo: z.string().min(1, 'Tipo de solicitação é obrigatório'),
  linha: z.string().optional().default(''),
  referencia: z.string().optional().default(''),
  pedido: z.string().optional().default(''),
  descricao: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  avaliacao: z.string().optional().default('—'),
  arquivo_nome: z.string().optional(),
  arquivo_b64: z.string().optional(),
  lgpd: z.boolean().refine((val) => val === true, {
    message: 'Consentimento LGPD é obrigatório',
  }),
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

function gerarProtocolo(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${String(Math.floor(Math.random() * 9000) + 1000)}`
}

function getContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const types: Record<string, string> = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    bmp: 'image/bmp',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  }
  return types[ext] || 'application/octet-stream'
}

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
        { status: 429, headers: { 'Retry-After': '60' } },
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
          { status: 400 },
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
        },
      )
      const turnstileData = await turnstileRes.json()

      if (!turnstileData.success) {
        return NextResponse.json(
          { error: 'Verificação anti-spam falhou. Tente novamente.' },
          { status: 400 },
        )
      }
    }

    // --- Zod validation ---
    const parsed = sacSchema.safeParse(body)
    if (!parsed.success) {
      const errors = parsed.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }))
      return NextResponse.json({ error: 'Dados inválidos', errors }, { status: 400 })
    }

    const data = parsed.data
    const protocolo = gerarProtocolo()

    // --- Send email via Resend ---
    const resendApiKey = process.env.RESEND_API_KEY
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey)

        const emailHtml = `
          <h2 style="color:#1C2632;">Nova solicitação SAC</h2>
          <p><strong>Protocolo:</strong> #${protocolo}</p>
          <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
          <hr />
          <table style="border-collapse:collapse;width:100%;">
            <tr><td style="padding:6px 12px;font-weight:600;color:#5c5b57;">Nome</td><td style="padding:6px 12px;">${data.nome}</td></tr>
            <tr><td style="padding:6px 12px;font-weight:600;color:#5c5b57;">CPF/CNPJ</td><td style="padding:6px 12px;">${data.documento}</td></tr>
            <tr><td style="padding:6px 12px;font-weight:600;color:#5c5b57;">E-mail</td><td style="padding:6px 12px;">${data.email}</td></tr>
            <tr><td style="padding:6px 12px;font-weight:600;color:#5c5b57;">Telefone</td><td style="padding:6px 12px;">${data.telefone || '—'}</td></tr>
            <tr><td style="padding:6px 12px;font-weight:600;color:#5c5b57;">Tipo</td><td style="padding:6px 12px;">${data.tipo}</td></tr>
            <tr><td style="padding:6px 12px;font-weight:600;color:#5c5b57;">Linha do produto</td><td style="padding:6px 12px;">${data.linha || '—'}</td></tr>
            <tr><td style="padding:6px 12px;font-weight:600;color:#5c5b57;">Referência/modelo</td><td style="padding:6px 12px;">${data.referencia || '—'}</td></tr>
            <tr><td style="padding:6px 12px;font-weight:600;color:#5c5b57;">Pedido/NF</td><td style="padding:6px 12px;">${data.pedido || '—'}</td></tr>
            <tr><td style="padding:6px 12px;font-weight:600;color:#5c5b57;">Avaliação</td><td style="padding:6px 12px;">${'★'.repeat(Number(data.avaliacao) || 0)}${'☆'.repeat(5 - (Number(data.avaliacao) || 0))}</td></tr>
          </table>
          <hr />
          <h3 style="color:#1C2632;">Descrição</h3>
          <p style="white-space:pre-wrap;">${data.descricao}</p>
          ${data.arquivo_nome ? `<p style="color:#5c5b57;">📎 Anexo: ${data.arquivo_nome}</p>` : ''}
        `

        const emailPayload: Parameters<typeof resend.emails.send>[0] = {
          from: process.env.RESEND_FROM_EMAIL || 'contato@mail.pradocalcados.com.br',
          to: 'sac@pradocalcados.com.br',
          subject: `📋 SAC - ${data.tipo} - #${protocolo}`,
          html: emailHtml,
        }

        // Attach file if provided
        if (data.arquivo_nome && data.arquivo_b64) {
          emailPayload.attachments = [
            {
              filename: data.arquivo_nome,
              content: data.arquivo_b64,
              contentType: getContentType(data.arquivo_nome),
            },
          ]
        }

        await resend.emails.send(emailPayload)
      } catch (emailError) {
        console.error('Erro ao enviar e-mail via Resend:', emailError)
        // Non-blocking: don't fail the request if e-mail fails
      }
    }

    return NextResponse.json(
      {
        message: 'Solicitação registrada com sucesso. Nossa equipe retornará em até 5 dias úteis.',
        protocolo,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Erro inesperado no formulário SAC:', error)
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}
