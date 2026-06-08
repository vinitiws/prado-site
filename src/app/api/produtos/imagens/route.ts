import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(request: Request) {
  // Auth check first
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

  const { data: registro } = await supabase
    .from('produto_imagens')
    .select('url')
    .eq('id', id)
    .single()

  const publicUrl = registro?.url
  const storagePath = publicUrl ? extractStoragePath(publicUrl, 'imagens') : null

  if (storagePath) {
    await supabase.storage.from('imagens').remove([storagePath])
  }

  const { error } = await supabase
    .from('produto_imagens')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

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
