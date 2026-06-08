'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutPage() {
  const router = useRouter()
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    async function handleLogout() {
      if (!supabase) {
        router.push('/admin/login')
        return
      }

      await supabase.auth.signOut()
      router.refresh()
      router.push('/admin/login')
    }

    handleLogout()
  }, [supabase, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-bege">Saindo...</p>
    </div>
  )
}
