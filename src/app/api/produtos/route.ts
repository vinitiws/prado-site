import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 })
  }

  // Auth check for admin access to all produtos (incl. inativos)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    // Public: return only active produtos
    const { data, error } = await supabase
      .from('produtos')
      .select('*, imagens:produto_imagens(*)')
      .eq('ativo', true)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data)
  }

  // Admin: return all produtos
  const { data, error } = await supabase
    .from('produtos')
    .select('*, imagens:produto_imagens(*)')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 })
  }

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await request.json()

  const { data, error } = await supabase
    .from('produtos')
    .insert(body)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
