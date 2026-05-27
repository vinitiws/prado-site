'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ProductCards } from '@/components/home/product-cards'
import { AnimatedSection } from '@/components/ui/animated-section'
import type { Produto, Categoria, Subcategoria } from '@/types'

export function ProdutoListClient() {
  const searchParams = useSearchParams()
  const categoriaSlug = searchParams.get('categoria')
  const subcategoriaSlug = searchParams.get('subcategoria')

  const [produtos, setProdutos] = useState<Produto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCat, setSelectedCat] = useState(categoriaSlug || '')
  const [selectedSub, setSelectedSub] = useState(subcategoriaSlug || '')

  const [supabase, setSupabase] = useState<ReturnType<typeof createClient>>(null)

  useEffect(() => {
    setSupabase(createClient())
  }, [])

  useEffect(() => {
    if (!supabase) return
    loadCategorias()
  }, [supabase])

  useEffect(() => {
    if (!supabase) return
    if (selectedCat) {
      loadSubcategorias(selectedCat)
    }
    loadProdutos()
  }, [supabase, selectedCat, selectedSub])

  async function loadCategorias() {
    if (!supabase) return
    const { data } = await supabase
      .from('categorias')
      .select('*')
      .order('ordem')
    if (data) setCategorias(data)
  }

  async function loadSubcategorias(catSlug: string) {
    if (!supabase) return
    const { data: cat } = await supabase
      .from('categorias')
      .select('id')
      .eq('slug', catSlug)
      .single()

    if (cat) {
      const { data } = await supabase
        .from('subcategorias')
        .select('*')
        .eq('categoria_id', cat.id)
        .order('ordem')
      if (data) setSubcategorias(data)
    }
  }

  async function loadProdutos() {
    if (!supabase) return
    setLoading(true)
    let query = supabase
      .from('produtos')
      .select('*, imagens:produto_imagens(*)')
      .eq('ativo', true)

    if (selectedSub) {
      const { data: sub } = await supabase
        .from('subcategorias')
        .select('id')
        .eq('slug', selectedSub)
        .single()
      if (sub) query = query.eq('subcategoria_id', sub.id)
    } else if (selectedCat) {
      const subRes = await supabase
        .from('subcategorias')
        .select('id')
        .eq('categoria_id', (await supabase.from('categorias').select('id').eq('slug', selectedCat).single()).data?.id)
      const ids = subRes.data?.map((s) => s.id) || []
      if (ids.length > 0) query = query.in('subcategoria_id', ids)
    }

    const { data } = await query.order('created_at', { ascending: false })
    if (data) setProdutos(data)
    setLoading(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-marinho mb-2">
          Nossos Produtos
        </h1>
        <p className="text-bege text-sm sm:text-base">
          Filtre por categoria ou subcategoria para encontrar o modelo ideal.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => {
            setSelectedCat('')
            setSelectedSub('')
          }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !selectedCat
              ? 'bg-marinho text-branco'
              : 'bg-bege/20 text-azul hover:bg-bege/30'
          }`}
        >
          Todos
        </button>
        {categorias.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCat(cat.slug)
              setSelectedSub('')
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCat === cat.slug
                ? 'bg-marinho text-branco'
                : 'bg-bege/20 text-azul hover:bg-bege/30'
            }`}
          >
            {cat.nome}
          </button>
        ))}
      </div>

      {subcategorias.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedSub('')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !selectedSub
                ? 'bg-safety text-marinho'
                : 'bg-bege/10 text-bege hover:bg-bege/20'
            }`}
          >
            Todas
          </button>
          {subcategorias.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSub(sub.slug)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedSub === sub.slug
                  ? 'bg-safety text-marinho'
                  : 'bg-bege/10 text-bege hover:bg-bege/20'
              }`}
            >
              {sub.nome}
            </button>
          ))}
        </div>
      )}

      <AnimatedSection>
        {loading ? (
          <div className="text-center py-12 text-bege">Carregando...</div>
        ) : (
          <ProductCards produtos={produtos} />
        )}
      </AnimatedSection>
    </div>
  )
}
