import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  if (supabase) {
    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('produtos').delete().eq('id', id)
    }
  }

  redirect('/admin/produtos')
}
