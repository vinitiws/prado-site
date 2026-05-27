'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Categoria, Subcategoria } from '@/types'

export default function NovoProdutoPage() {
  const router = useRouter()
  const [supabase] = useState(() => createClient())

  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([])
  const [selectedCat, setSelectedCat] = useState('')
  const [loading, setLoading] = useState(false)

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
    supabase
      .from('categorias')
      .select('*')
      .order('ordem')
      .then(({ data }) => {
        if (data) setCategorias(data)
      })
  }, [supabase])

  useEffect(() => {
    if (!selectedCat || !supabase) {
      setSubcategorias([])
      return
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    setLoading(true)

    const slug = form.nome
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-')
      .concat('-ref-', form.ref.toLowerCase().replace(/[^\w]/g, ''))

    const { error } = await supabase.from('produtos').insert({
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

    setLoading(false)

    if (error) {
      alert('Erro ao criar produto: ' + error.message)
      return
    }

    router.push('/admin/produtos')
    router.refresh()
  }

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-marinho mb-6">Novo Produto</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="nome"
            label="Nome do Produto"
            value={form.nome}
            onChange={(e) => updateField('nome', e.target.value)}
            required
          />
          <Input
            id="ref"
            label="Referência"
            value={form.ref}
            onChange={(e) => updateField('ref', e.target.value)}
            required
          />
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
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Produto'}
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
