'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { href: '/', label: 'Início' },
  { href: '/produtos', label: 'Produtos' },
  { href: '/sobre', label: 'Sobre' },
  { href: '/parceiro', label: 'Seja Parceiro' },
]

function HamburgerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
      <line x1="4" y1="8" x2="20" y2="8" />
      <line x1="4" y1="16" x2="20" y2="16" />
    </svg>
  )
}

interface HeroNavbarProps {
  bgGradient?: string
}

export function HeroNavbar({ bgGradient }: HeroNavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (pathname?.startsWith('/admin')) return null

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-500 ${
        scrolled
          ? 'bg-branco/95 backdrop-blur-sm shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Prado Calçados Logo"
            className={`h-8 w-auto transition-opacity duration-300 ${
              scrolled ? 'opacity-100' : 'opacity-100'
            }`}
          />
          <span
            className={`text-xl font-bold tracking-tight transition-colors duration-300 ${
              scrolled ? 'text-marinho' : 'text-branco'
            }`}
          >
            PRADO
          </span>
          <span
            className={`hidden sm:inline text-sm font-medium transition-colors duration-300 ${
              scrolled ? 'text-safety' : 'text-safety/80'
            }`}
          >
            CALÇADOS
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium tracking-wide uppercase transition-colors duration-300 ${
                scrolled
                  ? 'text-azul/70 hover:text-azul'
                  : 'text-branco/80 hover:text-branco'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          className={`md:hidden p-2 transition-colors duration-300 ${
            scrolled ? 'text-azul' : 'text-branco'
          }`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Abrir menu"
        >
          {isOpen ? <X size={24} /> : <HamburgerIcon />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`md:hidden overflow-hidden transition-all duration-500 ${
              scrolled
                ? 'bg-branco/95 backdrop-blur-sm'
                : ''
            }`}
            style={{
              background: !scrolled && bgGradient
                ? bgGradient
                : undefined,
            }}
          >
            <nav className="flex flex-col px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-base font-medium py-2 transition-colors ${
                    scrolled
                      ? 'text-azul/70 hover:text-azul'
                      : 'text-branco/80 hover:text-branco'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
