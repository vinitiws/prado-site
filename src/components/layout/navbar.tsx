'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { href: '/', label: 'Início' },
  { href: '/produtos', label: 'Produtos' },
  { href: '/sobre', label: 'Sobre' },
  { href: '/parceiro', label: 'Seja Parceiro' },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Esconde navbar nas páginas do admin
  if (pathname?.startsWith('/admin')) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-branco/95 backdrop-blur-sm border-b border-bege/20">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
        <img
            src="/logo.png"
            alt="Prado Calçados Logo"
            className="h-8 w-auto"
          />
          <span className="text-xl font-bold text-marinho tracking-tight">
            PRADO
          </span>
          <span className="hidden sm:inline text-sm text-safety font-medium">
            CALÇADOS
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-azul/70 hover:text-azul transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/sac"
            className="hidden md:inline-flex items-center gap-1.5 rounded-lg bg-country text-branco px-4 py-2 text-sm font-semibold transition-all hover:bg-country/90 hover:shadow-md"
          >
            📞 SAC
          </Link>

          <button
            className="md:hidden p-2 text-azul"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Abrir menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-bege/20 overflow-hidden"
          >
            <nav className="flex flex-col px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-base font-medium text-azul/70 hover:text-azul py-2 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/sac"
                className="flex items-center gap-2 rounded-lg bg-country text-branco px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-country/90"
                onClick={() => setIsOpen(false)}
              >
                📞 SAC
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
