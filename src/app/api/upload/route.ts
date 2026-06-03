import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

const uploadSchema = z.object({
  tipo: z.enum(['carousel', 'card', 'banner']),
  id: z.string().nullable().optional(),
  titulo: z.string().nullable().optional(),
  subtitulo: z.string().nullable().optional(),
  link: z.string().nullable().optional(),
  ordem: z.coerce.number().int().min(0).default(0),
})

function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `Tipo não permitido (${file.type}). Aceitos: jpg, jpeg, png, webp.`
  }
  if (file.size > MAX_SIZE) {
    return `Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(1)}MB). Máximo: 10MB.`
  }
  return null
}

export async function POST(request: Request) {
  const supabase = createAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'Arquivo é obrigatório' }, { status: 400 })
  }

  const fileError = validateFile(file)
  if (fileError) return NextResponse.json({ error: fileError }, { status: 400 })

  const parsed = uploadSchema.safeParse({
    tipo: formData.get('tipo'),
    id: formData.get('id'),
    titulo: formData.get('titulo'),
    subtitulo: formData.get('subtitulo'),
    link: formData.get('link'),
    ordem: formData.get('ordem'),
  })

  if (!parsed.success) {
    const errors = parsed.error.issues.map(i => i.message).join(', ')
    return NextResponse.json({ error: errors }, { status: 400 })
  }

  const { tipo, id, titulo, subtitulo, link, ordem } = parsed.data

  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}.${fileExt}`
  const filePath = `site/${tipo}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('imagens')
    .upload(filePath, file)

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: urlData } = supabase.storage
    .from('imagens')
    .getPublicUrl(filePath)

  // If editing an existing image, update it instead of inserting
  if (id) {
    // Get old image URL to delete from storage
    const { data: oldImg } = await supabase
      .from('site_imagens')
      .select('url')
      .eq('id', id)
      .single()

    const { data, error: dbError } = await supabase
      .from('site_imagens')
      .update({
        url: urlData.publicUrl,
        titulo: titulo || null,
        subtitulo: subtitulo || null,
        link: link || null,
      })
      .eq('id', id)
      .select()
      .single()

    if (dbError) {
      await supabase.storage.from('imagens').remove([filePath])
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    // Delete old file from storage
    if (oldImg?.url) {
      try {
        const u = new URL(oldImg.url)
        const prefix = '/object/public/imagens/'
        const pathIndex = u.pathname.indexOf(prefix)
        if (pathIndex !== -1) {
          const oldPath = u.pathname.slice(pathIndex + prefix.length)
          await supabase.storage.from('imagens').remove([oldPath])
        }
      } catch { /* ignore old file deletion errors */ }
    }

    return NextResponse.json(data)
  }

  // Create new record (original behavior)
  const { data, error: dbError } = await supabase
    .from('site_imagens')
    .insert({
      tipo,
      url: urlData.publicUrl,
      titulo: titulo || null,
      subtitulo: subtitulo || null,
      link: link || null,
      ordem,
    })
    .select()
    .single()

  if (dbError) {
    await supabase.storage.from('imagens').remove([filePath])
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
