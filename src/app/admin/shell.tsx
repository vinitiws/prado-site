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
      <aside className="hidden lg:flex flex-col w-64 bg-marinho text-branco p-6">
        <Link href="/admin/dashboard" className="text-lg font-bold mb-8">
          PRADO ADMIN
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
        <form action="/auth/logout" method="post">
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-bege/70 hover:text-branco hover:bg-branco/10 w-full transition-colors"
          >
            <LogOut size={18} />
            Sair
          </button>
        </form>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="lg:hidden bg-marinho text-branco px-4 py-3 flex items-center justify-between">
          <span className="font-bold">PRADO ADMIN</span>
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
