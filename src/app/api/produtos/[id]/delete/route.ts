import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  if (supabase) {
    await supabase.from('produtos').delete().eq('id', id)
  }

  redirect('/admin/produtos')
}
