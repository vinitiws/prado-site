'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2 } from 'lucide-react'
import type { SiteImagem } from '@/types'
import type { SupabaseClient } from '@supabase/supabase-js'

const tipos = [
  { value: 'carousel' as const, label: 'Carousel (Hero)' },
  { value: 'card' as const, label: 'Card de Categoria' },
  { value: 'banner' as const, label: 'Banner' },
]

export default function AdminImagensPage() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null)
  const [imagens, setImagens] = useState<SiteImagem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  const [form, setForm] = useState({
    tipo: 'carousel' as SiteImagem['tipo'],
    titulo: '',
    subtitulo: '',
    link: '',
  })

  useEffect(() => {
    setSupabase(createClient())
  }, [])

  const loadImagens = useCallback(async () => {
    if (!supabase) return
    const { data } = await supabase
      .from('site_imagens')
      .select('*')
      .order('ordem')
    if (data) setImagens(data)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadImagens()
  }, [loadImagens])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!supabase) return
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `site/${form.tipo}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('imagens')
      .upload(filePath, file)

    if (uploadError) {
      alert('Erro ao fazer upload: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage
      .from('imagens')
      .getPublicUrl(filePath)

    const { error: dbError } = await supabase.from('site_imagens').insert({
      tipo: form.tipo,
      url: urlData.publicUrl,
      titulo: form.titulo || null,
      subtitulo: form.subtitulo || null,
      link: form.link || null,
      ordem: imagens.length,
    })

    setUploading(false)

    if (dbError) {
      alert('Erro ao salvar: ' + dbError.message)
      return
    }

    setForm({ tipo: 'carousel', titulo: '', subtitulo: '', link: '' })
    loadImagens()
  }

  const handleDelete = async (id: string) => {
    if (!supabase) return
    if (!confirm('Excluir esta imagem?')) return

    const { error } = await supabase
      .from('site_imagens')
      .delete()
      .eq('id', id)
    if (error) {
      alert('Erro ao excluir: ' + error.message)
      return
    }
    loadImagens()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-marinho mb-6">Imagens do Site</h1>

      <div className="bg-branco rounded-xl border border-bege/20 p-6 mb-8">
        <h2 className="text-lg font-bold text-marinho mb-4">Adicionar Imagem</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-marinho mb-1">
              Tipo
            </label>
            <select
              value={form.tipo}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  tipo: e.target.value as SiteImagem['tipo'],
                }))
              }
              className="flex h-11 w-full rounded-lg border border-bege bg-branco px-4 py-2 text-sm text-marinho focus:outline-none focus:ring-2 focus:ring-safety"
            >
              {tipos.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <Input
            id="titulo"
            label="Título"
            value={form.titulo}
            onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
          />
          <Input
            id="subtitulo"
            label="Subtítulo"
            value={form.subtitulo}
            onChange={(e) =>
              setForm((f) => ({ ...f, subtitulo: e.target.value }))
            }
          />
          <Input
            id="link"
            label="Link (opcional)"
            value={form.link}
            onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-marinho mb-1">
            Arquivo de Imagem
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading || !supabase}
            className="block w-full text-sm text-bege file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-safety file:text-marinho hover:file:bg-safety/90 disabled:opacity-50"
          />
          {uploading && <p className="text-sm text-bege mt-1">Enviando...</p>}
        </div>
      </div>

      <div className="space-y-4">
        {tipos.map((tipo) => {
          const filtered = imagens.filter((img) => img.tipo === tipo.value)
          if (filtered.length === 0) return null

          return (
            <div
              key={tipo.value}
              className="bg-branco rounded-xl border border-bege/20 p-6"
            >
              <h3 className="text-lg font-bold text-marinho mb-4">
                {tipo.label}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((img) => (
                  <div
                    key={img.id}
                    className="relative group rounded-lg overflow-hidden border border-bege/20"
                  >
                    <div className="aspect-video bg-bege/10">
                      <img
                        src={img.url}
                        alt={img.titulo || ''}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      {img.titulo && (
                        <p className="text-sm font-medium text-marinho truncate">
                          {img.titulo}
                        </p>
                      )}
                      {img.link && (
                        <p className="text-xs text-bege truncate">
                          {img.link}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(img.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {!loading && imagens.length === 0 && (
          <p className="text-bege text-center py-8">
            Nenhuma imagem cadastrada ainda.
          </p>
        )}
      </div>
    </div>
  )
}
