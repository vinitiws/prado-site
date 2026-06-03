import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: produtoId } = await params
  const supabase = createAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 })
  }

  const formData = await request.formData()
  const files = formData.getAll('files') as File[]

  if (files.length === 0) {
    return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
  }

  const results: { url: string; ordem: number }[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const ext = file.name.split('.').pop()
    const fileName = `${produtoId}-${Date.now()}-${i}.${ext}`
    const filePath = `produtos/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('imagens')
      .upload(filePath, file)

    if (uploadError) {
      // Rollback already uploaded files
      for (const r of results) {
        const oldPath = extractStoragePath(r.url, 'imagens')
        if (oldPath) await supabase.storage.from('imagens').remove([oldPath])
      }
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: urlData } = supabase.storage
      .from('imagens')
      .getPublicUrl(filePath)

    results.push({ url: urlData.publicUrl, ordem: i + 1 })
  }

  // Insert all records
  const { data, error: dbError } = await supabase
    .from('produto_imagens')
    .insert(
      results.map((r) => ({
        produto_id: produtoId,
        url: r.url,
        ordem: r.ordem,
      }))
    )
    .select()

  if (dbError) {
    // Rollback storage uploads
    for (const r of results) {
      const path = extractStoragePath(r.url, 'imagens')
      if (path) await supabase.storage.from('imagens').remove([path])
    }
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
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
