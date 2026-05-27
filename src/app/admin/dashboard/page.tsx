import { createClient } from '@/lib/supabase/server'
import { Package, Image as ImageIcon, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()
  if (!supabase) return <div>Supabase não configurado</div>

  const { count: totalProdutos } = await supabase
    .from('produtos')
    .select('*', { count: 'exact', head: true })

  const { count: totalImagens } = await supabase
    .from('site_imagens')
    .select('*', { count: 'exact', head: true })

  const { count: destaques } = await supabase
    .from('produtos')
    .select('*', { count: 'exact', head: true })
    .eq('destaque', true)

  const { data: recentes } = await supabase
    .from('produtos')
    .select('nome, ref, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div>
      <h1 className="text-2xl font-bold text-marinho mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-branco rounded-xl border border-bege/20 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Package className="text-safety" size={24} />
            <span className="text-sm text-bege">Produtos</span>
          </div>
          <span className="text-3xl font-bold text-marinho">
            {totalProdutos ?? 0}
          </span>
        </div>
        <div className="bg-branco rounded-xl border border-bege/20 p-6">
          <div className="flex items-center gap-3 mb-2">
            <ImageIcon className="text-safety" size={24} />
            <span className="text-sm text-bege">Imagens do Site</span>
          </div>
          <span className="text-3xl font-bold text-marinho">
            {totalImagens ?? 0}
          </span>
        </div>
        <div className="bg-branco rounded-xl border border-bege/20 p-6">
          <div className="flex items-center gap-3 mb-2">
            <ArrowUpRight className="text-safety" size={24} />
            <span className="text-sm text-bege">Produtos em Destaque</span>
          </div>
          <span className="text-3xl font-bold text-marinho">
            {destaques ?? 0}
          </span>
        </div>
      </div>

      <div className="bg-branco rounded-xl border border-bege/20 p-6">
        <h2 className="text-lg font-bold text-marinho mb-4">Últimos Produtos</h2>
        {recentes && recentes.length > 0 ? (
          <div className="divide-y divide-bege/10">
            {recentes.map((p) => (
              <div key={p.ref} className="py-3 flex justify-between items-center">
                <div>
                  <span className="text-sm font-medium text-marinho">{p.nome}</span>
                  <span className="text-xs text-bege ml-2">REF. {p.ref}</span>
                </div>
                <span className="text-xs text-bege">
                  {new Date(p.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-bege">Nenhum produto cadastrado ainda.</p>
        )}
        <Link
          href="/admin/produtos/novo"
          className="inline-block mt-4 text-sm font-medium text-safety hover:text-safety/80 transition-colors"
        >
          + Adicionar Produto
        </Link>
      </div>
    </div>
  )
}
