import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

const uploadSchema = z.object({
  tipo: z.enum(['carousel', 'card', 'banner']),
  id: z.string().nullable().optional(),
  titulo: z.string().nullable().optional(),
  subtitulo: z.string().nullable().optional(),
  descricao: z.string().nullable().optional(),
  cta_texto: z.string().nullable().optional(),
  link: z.string().nullable().optional(),
  ordem: z.coerce.number().int().min(0).default(0),
})

type UploadResult =
  | { ok: true; publicUrl: string; storagePath: string }
  | { ok: false; error: string }

function validateFile(file: File, label: string): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `${label}: tipo não permitido (${file.type}). Aceitos: jpg, jpeg, png, webp.`
  }
  if (file.size > MAX_SIZE) {
    return `${label}: arquivo muito grande (${(file.size / 1024 / 1024).toFixed(1)}MB). Máximo: 10MB.`
  }
  return null
}

/**
 * Extract storage path from a Supabase Storage public URL.
 */
function extractStoragePath(url: string, bucket: string): string | null {
  try {
    const u = new URL(url)
    const prefix = `/object/public/${bucket}/`
    const pathIndex = u.pathname.indexOf(prefix)
    if (pathIndex === -1) return null
    return u.pathname.slice(pathIndex + prefix.length)
  } catch {
    return null
  }
}

/**
 * Upload a file to Supabase Storage and return the public URL and storage path.
 */
async function uploadFile(
  supabase: SupabaseClient,
  file: File,
  tipo: string,
  prefix: string
): Promise<UploadResult> {
  const fileExt = file.name.split('.').pop()
  const uniqueId = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  const fileName = `${uniqueId}.${fileExt}`
  const filePath = `site/${tipo}/${prefix}-${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('imagens')
    .upload(filePath, file)

  if (uploadError) {
    return { ok: false, error: uploadError.message }
  }

  const { data: urlData } = supabase.storage
    .from('imagens')
    .getPublicUrl(filePath)

  return { ok: true, publicUrl: urlData.publicUrl, storagePath: filePath }
}

export async function POST(request: Request) {
  // Auth check
  const serverSupabase = await createClient()
  if (!serverSupabase) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 })
  }
  const { data: { user } } = await serverSupabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const supabase = createAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const mobileFile = formData.get('mobile_file') as File | null
  const id = formData.get('id') as string | null

  const isEditing = !!id

  if (!isEditing && !file) {
    return NextResponse.json({ error: 'Arquivo de imagem desktop é obrigatório' }, { status: 400 })
  }

  if (isEditing && !file && !mobileFile) {
    return NextResponse.json({ error: 'Selecione ao menos uma imagem para substituir' }, { status: 400 })
  }

  if (file) {
    const fileError = validateFile(file, 'Imagem Desktop')
    if (fileError) return NextResponse.json({ error: fileError }, { status: 400 })
  }

  if (mobileFile) {
    const mobileError = validateFile(mobileFile, 'Imagem Mobile')
    if (mobileError) return NextResponse.json({ error: mobileError }, { status: 400 })
  }

  const parsed = uploadSchema.safeParse({
    tipo: formData.get('tipo'),
    id: formData.get('id'),
    titulo: formData.get('titulo'),
    subtitulo: formData.get('subtitulo'),
    descricao: formData.get('descricao'),
    cta_texto: formData.get('cta_texto'),
    link: formData.get('link'),
    ordem: formData.get('ordem'),
  })

  if (!parsed.success) {
    const errors = parsed.error.issues.map(i => i.message).join(', ')
    return NextResponse.json({ error: errors }, { status: 400 })
  }

  const { tipo, titulo, subtitulo, descricao, cta_texto, link, ordem } = parsed.data

  // Upload desktop image if provided
  let desktopResult: UploadResult | null = null
  if (file) {
    desktopResult = await uploadFile(supabase, file, tipo, 'desktop')
    if (!desktopResult.ok) {
      return NextResponse.json({ error: `Desktop: ${desktopResult.error}` }, { status: 500 })
    }
  }

  // Upload mobile image if provided
  let mobileResult: UploadResult | null = null
  if (mobileFile) {
    mobileResult = await uploadFile(supabase, mobileFile, tipo, 'mobile')
    if (!mobileResult.ok) {
      if (desktopResult) {
        await supabase.storage.from('imagens').remove([desktopResult.storagePath])
      }
      return NextResponse.json({ error: `Mobile: ${mobileResult.error}` }, { status: 500 })
    }
  }

  // If editing an existing image
  if (isEditing) {
    const { data: oldImg } = await supabase
      .from('site_imagens')
      .select('url, url_mobile')
      .eq('id', id)
      .single()

    const updateData: Record<string, unknown> = {
      titulo: titulo || null,
      subtitulo: subtitulo || null,
      descricao: descricao || null,
      cta_texto: cta_texto || null,
      link: link || null,
    }

    if (desktopResult) {
      updateData.url = desktopResult.publicUrl
    }

    if (mobileResult) {
      updateData.url_mobile = mobileResult.publicUrl
    }

    const { data, error: dbError } = await supabase
      .from('site_imagens')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (dbError) {
      if (desktopResult) await supabase.storage.from('imagens').remove([desktopResult.storagePath])
      if (mobileResult) await supabase.storage.from('imagens').remove([mobileResult.storagePath])
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    // Delete old files from storage
    if (desktopResult && oldImg?.url) {
      const oldPath = extractStoragePath(oldImg.url, 'imagens')
      if (oldPath) {
        await supabase.storage.from('imagens').remove([oldPath]).catch(() => {
          console.warn('Upload: não foi possível excluir imagem desktop antiga:', oldPath)
        })
      }
    }

    if (mobileResult && oldImg?.url_mobile) {
      const oldMobilePath = extractStoragePath(oldImg.url_mobile, 'imagens')
      if (oldMobilePath) {
        await supabase.storage.from('imagens').remove([oldMobilePath]).catch(() => {
          console.warn('Upload: não foi possível excluir imagem mobile antiga:', oldMobilePath)
        })
      }
    }

    return NextResponse.json(data)
  }

  // Create new record
  const insertData: Record<string, unknown> = {
    tipo,
    url: desktopResult!.publicUrl,
    titulo: titulo || null,
    subtitulo: subtitulo || null,
    descricao: descricao || null,
    cta_texto: cta_texto || null,
    link: link || null,
    ordem,
  }

  if (mobileResult) {
    insertData.url_mobile = mobileResult.publicUrl
  }

  const { data, error: dbError } = await supabase
    .from('site_imagens')
    .insert(insertData)
    .select()
    .single()

  if (dbError) {
    await supabase.storage.from('imagens').remove([desktopResult!.storagePath])
    if (mobileResult) await supabase.storage.from('imagens').remove([mobileResult.storagePath])
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
