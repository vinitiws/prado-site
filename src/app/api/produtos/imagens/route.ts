import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
  const supabase = createAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 })
  }

  const { imageId } = await request.json()
  if (!imageId) {
    return NextResponse.json({ error: 'imageId é obrigatório' }, { status: 400 })
  }

  // Get the image URL before deleting so we can remove from storage
  const { data: img } = await supabase
    .from('produto_imagens')
    .select('url')
    .eq('id', imageId)
    .single()

  if (img?.url) {
    const path = extractStoragePath(img.url, 'imagens')
    if (path) {
      await supabase.storage.from('imagens').remove([path])
    }
  }

  const { error } = await supabase
    .from('produto_imagens')
    .delete()
    .eq('id', imageId)

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
