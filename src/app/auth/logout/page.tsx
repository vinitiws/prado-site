'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!supabase) {
      router.push('/')
      return
    }
    supabase.auth.signOut().then(() => {
      router.push('/')
      router.refresh()
    })
  }, [supabase, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-bege">Saindo...</p>
    </div>
  )
}
