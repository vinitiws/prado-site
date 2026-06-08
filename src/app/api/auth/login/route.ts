import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  if (!supabase) {
    return NextResponse.json(
      { error: 'Supabase não configurado' },
      { status: 500 }
    )
  }

  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json(
      { error: 'E-mail e senha são obrigatórios' },
      { status: 400 }
    )
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }

  // Cookies são escritos automaticamente pelo onAuthStateChange do createServerClient
  return NextResponse.json({ success: true })
}
