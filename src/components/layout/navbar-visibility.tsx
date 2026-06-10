'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from './navbar'

export function NavbarVisibility() {
  const pathname = usePathname()
  const isHome = pathname === '/'

  // On home page, the hero has its own integrated navbar
  if (isHome) return null

  return <Navbar />
}
