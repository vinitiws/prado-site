import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ProdutoListClient } from './produto-list-client'

export const metadata: Metadata = {
  title: 'Produtos',
  description:
    'Conheça nossa linha completa de botinas e botas Prado. Segurança e tradição em cada modelo.',
}

export default async function ProdutosPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-bege">Carregando...</div>}>
      <ProdutoListClient />
    </Suspense>
  )
}
