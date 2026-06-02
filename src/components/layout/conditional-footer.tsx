'use client'

import { usePathname } from 'next/navigation'
import { Footer } from './footer'

export function ConditionalFooter() {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  if (isAdminRoute) {
    return null
  }

  return <Footer />
}
