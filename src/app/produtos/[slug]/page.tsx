import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProdutoDetailClient } from './produto-detail-client'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  if (!supabase) return { title: 'Produto não encontrado' }

  const { data: produto } = await supabase
    .from('produtos')
    .select('nome, descricao_curta, ref')
    .eq('slug', slug)
    .single()

  if (!produto) return { title: 'Produto não encontrado' }

  return {
    title: `${produto.nome} - Ref. ${produto.ref}`,
    description:
      produto.descricao_curta ||
      `Confira o modelo ${produto.nome} da Prado Calçados.`,
    openGraph: {
      title: `${produto.nome} - Prado Calçados`,
      description: produto.descricao_curta || '',
    },
  }
}

export default async function ProdutoPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  if (!supabase) notFound()

  const { data: produto } = await supabase
    .from('produtos')
    .select('*, imagens:produto_imagens(*), subcategoria:subcategorias(*)')
    .eq('slug', slug)
    .single()

  if (!produto) notFound()

  return <ProdutoDetailClient produto={produto} />
}
