import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File
  const tipo = formData.get('tipo') as string
  const titulo = formData.get('titulo') as string | null
  const subtitulo = formData.get('subtitulo') as string | null
  const cta_texto = formData.get('cta_texto') as string | null
  const link = formData.get('link') as string | null
  const ordem = parseInt(formData.get('ordem') as string) || 0

  if (!file || !tipo) {
    return NextResponse.json({ error: 'Arquivo e tipo são obrigatórios' }, { status: 400 })
  }

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

  const { data, error: dbError } = await supabase
    .from('site_imagens')
    .insert({
      tipo,
      url: urlData.publicUrl,
      titulo,
      subtitulo,
      cta_texto,
      link,
      ordem,
    })
    .select()
    .single()

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
