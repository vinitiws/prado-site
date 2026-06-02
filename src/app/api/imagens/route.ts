import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 })
  }

  const { data, error } = await supabase
    .from('site_imagens')
    .select('*')
    .eq('ativo', true)
    .order('ordem')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

/**
 * Extract the storage path from a Supabase Storage public URL.
 * URL format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
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

export async function DELETE(request: Request) {
  const supabase = createAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 })
  }

  const { id } = await request.json()
  if (!id) {
    return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
  }

  const { data: imagem, error: fetchError } = await supabase
    .from('site_imagens')
    .select('url')
    .eq('id', id)
    .single()

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  const pathsToDelete: string[] = []
  if (imagem?.url) {
    const path = extractStoragePath(imagem.url, 'imagens')
    if (path) pathsToDelete.push(path)
  }

  if (pathsToDelete.length > 0) {
    const { error: storageError } = await supabase.storage
      .from('imagens')
      .remove(pathsToDelete)

    if (storageError) {
      console.error('Erro ao deletar do Storage:', storageError)
    }
  }

  const { error: deleteError } = await supabase
    .from('site_imagens')
    .delete()
    .eq('id', id)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function PATCH(request: Request) {
  const supabase = createAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 })
  }

  const { id, ...updates } = await request.json()
  if (!id) {
    return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
  }

  const allowedFields = ['ativo', 'ordem', 'titulo', 'subtitulo', 'link']
  const sanitized: Record<string, unknown> = {}
  for (const key of allowedFields) {
    if (key in updates) sanitized[key] = updates[key]
  }

  if (Object.keys(sanitized).length === 0) {
    return NextResponse.json({ error: 'Nenhum campo válido para atualizar' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('site_imagens')
    .update(sanitized)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
