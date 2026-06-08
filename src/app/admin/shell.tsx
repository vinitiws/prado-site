'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LogOut, Package, Image, LayoutDashboard } from 'lucide-react'

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLogin = pathname === '/admin/login'

  if (isLogin) {
    return <div className="min-h-screen bg-bege/10">{children}</div>
  }

  return (
    <div className="min-h-screen bg-bege/10 flex">
      <aside className="fixed top-0 left-0 h-screen hidden lg:flex flex-col w-64 bg-marinho text-branco p-6">
        <Link href="/admin/dashboard" className="mb-8 flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Prado Calçados"
            className="h-10 w-auto"
          />
          <span className="text-xl font-bold text-branco tracking-tight">
            PRADO
          </span>
        </Link>
        <nav className="space-y-2 flex-1">
          {[
            { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { href: '/admin/produtos', label: 'Produtos', icon: Package },
            { href: '/admin/imagens', label: 'Imagens do Site', icon: Image },
          ].map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-bege/70 hover:text-branco hover:bg-branco/10 transition-colors"
              >
                <Icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <Link
          href="/auth/logout"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-bege/70 hover:text-branco hover:bg-branco/10 w-full transition-colors"
        >
          <LogOut size={18} />
          Sair
        </Link>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        <header className="lg:hidden bg-marinho text-branco px-4 py-3 flex items-center justify-between">
          <img
            src="/logo-principal.png"
            alt="Prado Calçados"
            className="h-8 w-auto"
          />
          <nav className="flex gap-4">
            <Link href="/admin/dashboard" className="text-xs text-bege/70 hover:text-branco">
              Dashboard
            </Link>
            <Link href="/admin/produtos" className="text-xs text-bege/70 hover:text-branco">
              Produtos
            </Link>
            <Link href="/admin/imagens" className="text-xs text-bege/70 hover:text-branco">
              Imagens
            </Link>
          </nav>
        </header>
        <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  )
}
