import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 })
  }

  // Auth check: if user is authenticated, return all images; otherwise only active
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
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

  const { data, error } = await supabase
    .from('site_imagens')
    .select('*')
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

  const { id } = await request.json()
  if (!id) {
    return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
  }

  // Fetch both desktop and mobile URLs
  const { data: imagem, error: fetchError } = await supabase
    .from('site_imagens')
    .select('url, url_mobile')
    .eq('id', id)
    .single()

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  // Collect all storage paths to delete
  const pathsToDelete: string[] = []

  if (imagem?.url) {
    const path = extractStoragePath(imagem.url, 'imagens')
    if (path) pathsToDelete.push(path)
  }

  if (imagem?.url_mobile) {
    const path = extractStoragePath(imagem.url_mobile, 'imagens')
    if (path) pathsToDelete.push(path)
  }

  // Delete files from Storage
  if (pathsToDelete.length > 0) {
    const { error: storageError } = await supabase.storage
      .from('imagens')
      .remove(pathsToDelete)

    if (storageError) {
      console.error('Erro ao deletar arquivos do Storage:', storageError)
    }
  }

  // Delete the database record
  const { error: deleteError } = await supabase
    .from('site_imagens')
    .delete()
    .eq('id', id)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  console.log(`Imagem ${id} excluída: ${pathsToDelete.length} arquivo(s) removido(s) do Storage`)
  return NextResponse.json({ success: true })
}

export async function PATCH(request: Request) {
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

  const { id, ...updates } = await request.json()
  if (!id) {
    return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
  }

  const allowedFields = [
    'ativo', 'ordem', 'titulo', 'subtitulo', 'descricao', 'cta_texto', 'link',
    'url_mobile',
  ]
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
