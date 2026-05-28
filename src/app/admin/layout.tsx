import type { Metadata } from 'next'
import AdminShell from './shell'

export const metadata: Metadata = {
  title: {
    template: '%s | Admin Prado',
    default: 'Admin Prado',
  },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminShell>{children}</AdminShell>
}
