'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { use } from 'react'
import { ProductImageUpload } from '@/components/admin/product-image-upload'
import type { Categoria, Subcategoria, Produto } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

export default function EditarProdutoPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const imageUploadRef = useRef<any>(null)
  const [existingImages, setExistingImages] = useState<any[]>([])

  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([])
  const [selectedCat, setSelectedCat] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [refDuplicada, setRefDuplicada] = useState(false)
  const [verificandoRef, setVerificandoRef] = useState(false)

  const [form, setForm] = useState({
    nome: '',
    ref: '',
    subcategoria_id: '',
    descricao_curta: '',
    descricao_completa: '',
    destaque: false,
    especificacoes_couro: '',
    especificacoes_solado: '',
    especificacoes_biqueira: '',
    especificacoes_norma: '',
  })

  useEffect(() => {
    if (!supabase) return
    const load = async () => {
      const { data: produto } = await supabase
        .from('produtos')
        .select('*')
        .eq('id', id)
        .single()

      if (produto) {
        setForm({
          nome: produto.nome,
          ref: produto.ref,
          subcategoria_id: produto.subcategoria_id || '',
          descricao_curta: produto.descricao_curta || '',
          descricao_completa: produto.descricao_completa || '',
          destaque: produto.destaque,
          especificacoes_couro: (produto.especificacoes as any)?.couro || '',
          especificacoes_solado: (produto.especificacoes as any)?.solado || '',
          especificacoes_biqueira: (produto.especificacoes as any)?.biqueira || '',
          especificacoes_norma: (produto.especificacoes as any)?.norma || '',
        })

        // Resolve a categoria da subcategoria do produto para preencher o select
        if (produto.subcategoria_id) {
          const { data: sub } = await supabase
            .from('subcategorias')
            .select('*, categorias!inner(slug)')
            .eq('id', produto.subcategoria_id)
            .single()

          if (sub) {
            const categoriaSlug = (sub as any).categorias?.slug
            if (categoriaSlug) setSelectedCat(categoriaSlug)
          }
        }
      }

      const { data: cats } = await supabase
        .from('categorias')
        .select('*')
        .order('ordem')
      if (cats) setCategorias(cats)

      const { data: imgs } = await supabase
        .from('produto_imagens')
        .select('*')
        .eq('produto_id', id)
        .order('ordem')
      if (imgs) setExistingImages(imgs)

      setInitialLoading(false)
    }

    load()
  }, [id, supabase])

  useEffect(() => {
    if (!selectedCat || !supabase) return
    supabase
      .from('categorias')
      .select('id')
      .eq('slug', selectedCat)
      .single()
      .then(({ data: cat }) => {
        if (cat) {
          supabase
            .from('subcategorias')
            .select('*')
            .eq('categoria_id', cat.id)
            .order('ordem')
            .then(({ data }) => {
              if (data) setSubcategorias(data)
            })
        }
      })
  }, [selectedCat, supabase])

  // Verificar ref quando o usuário digitar
  useEffect(() => {
    if (!supabase || !form.ref.trim()) {
      setRefDuplicada(false)
      return
    }

    const ref = form.ref.trim()
    setVerificandoRef(true)

    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('produtos')
        .select('id')
        .eq('ref', ref)
        .neq('id', id) // ignora o próprio produto na edição
        .maybeSingle()

      setRefDuplicada(!!data)
      setVerificandoRef(false)
    }, 400)

    return () => clearTimeout(timer)
  }, [form.ref, supabase, id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return

    // Verificação extra antes de salvar
    if (refDuplicada) {
      alert('Já existe outro produto com esta referência. Use uma ref diferente.')
      return
    }

    setLoading(true)

    const slug = form.nome
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-')
      .concat('-ref-', form.ref.toLowerCase().replace(/[^\w]/g, ''))

    const { error } = await supabase
      .from('produtos')
      .update({
        nome: form.nome,
        ref: form.ref,
        slug,
        subcategoria_id: form.subcategoria_id || null,
        descricao_curta: form.descricao_curta || null,
        descricao_completa: form.descricao_completa || null,
        destaque: form.destaque,
        especificacoes: {
          couro: form.especificacoes_couro || undefined,
          solado: form.especificacoes_solado || undefined,
          biqueira: form.especificacoes_biqueira || undefined,
          norma: form.especificacoes_norma || undefined,
        },
      })
      .eq('id', id)

    setLoading(false)

    if (error) {
      alert('Erro ao atualizar: ' + error.message)
      return
    }

    router.push('/admin/produtos')
    await imageUploadRef.current?.uploadNewImages(id)
    router.refresh()
  }

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  if (initialLoading) {
    return <div className="text-bege">Carregando...</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-marinho mb-6">Editar Produto</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="nome"
            label="Nome do Produto"
            value={form.nome}
            onChange={(e) => updateField('nome', e.target.value)}
            required
          />
          <div>
            <Input
              id="ref"
              label="Referência"
              value={form.ref}
              onChange={(e) => updateField('ref', e.target.value)}
              required
            />
            {refDuplicada && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                ⚠️ Esta referência já está em uso por outro produto.
              </p>
            )}
            {verificandoRef && form.ref.trim() && (
              <p className="mt-1 text-xs text-bege">Verificando...</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-marinho mb-1">
            Categoria
          </label>
          <select
            value={selectedCat}
            onChange={(e) => {
              setSelectedCat(e.target.value)
              updateField('subcategoria_id', '')
            }}
            className="flex h-11 w-full rounded-lg border border-bege bg-branco px-4 py-2 text-sm text-marinho focus:outline-none focus:ring-2 focus:ring-safety"
          >
            <option value="">Selecione uma categoria</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.nome}
              </option>
            ))}
          </select>
        </div>

        {subcategorias.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-marinho mb-1">
              Subcategoria
            </label>
            <select
              value={form.subcategoria_id}
              onChange={(e) => updateField('subcategoria_id', e.target.value)}
              className="flex h-11 w-full rounded-lg border border-bege bg-branco px-4 py-2 text-sm text-marinho focus:outline-none focus:ring-2 focus:ring-safety"
            >
              <option value="">Selecione uma subcategoria</option>
              {subcategorias.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.nome}
                </option>
              ))}
            </select>
          </div>
        )}

        <Input
          id="descricao_curta"
          label="Descrição Curta (vitrine)"
          value={form.descricao_curta}
          onChange={(e) => updateField('descricao_curta', e.target.value)}
        />

        <div>
          <label
            htmlFor="descricao_completa"
            className="block text-sm font-medium text-marinho mb-1"
          >
            Descrição Completa
          </label>
          <textarea
            id="descricao_completa"
            value={form.descricao_completa}
            onChange={(e) => updateField('descricao_completa', e.target.value)}
            rows={4}
            className="flex w-full rounded-lg border border-bege bg-branco px-4 py-2 text-sm text-marinho focus:outline-none focus:ring-2 focus:ring-safety placeholder:text-bege/70"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="especificacoes_couro"
            label="Tipo de Couro"
            value={form.especificacoes_couro}
            onChange={(e) => updateField('especificacoes_couro', e.target.value)}
          />
          <Input
            id="especificacoes_solado"
            label="Tipo de Solado"
            value={form.especificacoes_solado}
            onChange={(e) => updateField('especificacoes_solado', e.target.value)}
          />
          <Input
            id="especificacoes_biqueira"
            label="Tipo de Biqueira"
            value={form.especificacoes_biqueira}
            onChange={(e) => updateField('especificacoes_biqueira', e.target.value)}
          />
          <Input
            id="especificacoes_norma"
            label="Norma Técnica"
            value={form.especificacoes_norma}
            onChange={(e) => updateField('especificacoes_norma', e.target.value)}
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
        <ProductImageUpload ref={imageUploadRef} existingImages={existingImages} maxImages={3} />
          <input
            type="checkbox"
            checked={form.destaque}
            onChange={(e) => updateField('destaque', e.target.checked)}
            className="w-4 h-4 rounded border-bege text-safety focus:ring-safety"
          />
          <span className="text-sm font-medium text-marinho">
            Produto em destaque (aparece na homepage)
          </span>
        </label>

        <div className="flex gap-4">
          <Button type="submit" variant="primary" disabled={loading || refDuplicada}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/produtos')}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
