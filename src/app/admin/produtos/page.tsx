'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2 } from 'lucide-react'

export default function AdminProdutosPage() {
  const [supabase] = useState(() => createClient())
  const [produtos, setProdutos] = useState<any[]>([])

  useEffect(() => {
    if (!supabase) return
    supabase
      .from('produtos')
      .select('*, subcategoria:subcategorias(nome)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setProdutos(data)
      })
  }, [supabase])

  if (!supabase) return <div>Supabase não configurado</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-marinho">Produtos</h1>
        <Link href="/admin/produtos/novo">
          <Button variant="primary" size="sm">
            <Plus size={16} />
            Novo Produto
          </Button>
        </Link>
      </div>

      <div className="bg-branco rounded-xl border border-bege/20 overflow-hidden">
        {produtos && produtos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-bege/10">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-marinho">Produto</th>
                  <th className="text-left px-4 py-3 font-medium text-marinho hidden sm:table-cell">Ref</th>
                  <th className="text-left px-4 py-3 font-medium text-marinho hidden md:table-cell">Categoria</th>
                  <th className="text-left px-4 py-3 font-medium text-marinho hidden sm:table-cell">Destaque</th>
                  <th className="text-right px-4 py-3 font-medium text-marinho">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bege/10">
                {produtos.map((p) => (
                  <tr key={p.id} className="hover:bg-bege/5">
                    <td className="px-4 py-3 text-marinho font-medium">{p.nome}</td>
                    <td className="px-4 py-3 text-bege hidden sm:table-cell">{p.ref}</td>
                    <td className="px-4 py-3 text-bege hidden md:table-cell">
                      {p.subcategoria?.nome || '-'}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {p.destaque ? (
                        <span className="text-xs bg-safety/10 text-safety px-2 py-0.5 rounded-full font-medium">
                          Sim
                        </span>
                      ) : (
                        <span className="text-xs bg-bege/10 text-bege px-2 py-0.5 rounded-full">
                          Não
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/produtos/${p.id}`}
                          className="p-1.5 rounded-lg hover:bg-bege/10 text-bege hover:text-azul transition-colors"
                        >
                          <Edit size={16} />
                        </Link>
                        <form action={`/api/produtos/${p.id}/delete`} method="post">
                          <button
                            type="submit"
                            className="p-1.5 rounded-lg hover:bg-red-50 text-bege hover:text-red-500 transition-colors"
                            onClick={(e) => {
                              if (!confirm('Excluir este produto?')) e.preventDefault()
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-bege mb-4">Nenhum produto cadastrado.</p>
            <Link href="/admin/produtos/novo">
              <Button variant="primary" size="sm">
                <Plus size={16} />
                Criar primeiro produto
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
