'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Upload } from 'lucide-react'
import type { SiteImagem } from '@/types'
import { EditImageModal } from '@/components/admin/edit-image-modal'
import type { SupabaseClient } from '@supabase/supabase-js'
const supabaseClient = createClient()
const tipos = [
  { value: 'carousel' as const, label: 'Carousel (Hero)' },
  { value: 'card' as const, label: 'Card de Categoria' },
  { value: 'banner' as const, label: 'Banner' },
]

export default function AdminImagensPage() {
  const supabaseRef = useRef<SupabaseClient | null>(supabaseClient)
  const [imagens, setImagens] = useState<SiteImagem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [editingImage, setEditingImage] = useState<SiteImagem | null>(null)

  const [form, setForm] = useState({
    tipo: 'carousel' as SiteImagem['tipo'],
    titulo: '',
    subtitulo: '',
    link: '',
  })

  const loadImagens = useCallback(async () => {
    const supabase = supabaseRef.current
    if (!supabase) {
      setLoading(false)
      return
    }
    const { data } = await supabase
      .from('site_imagens')
      .select('*')
      .order('ordem')
    if (data) setImagens(data)
    setLoading(false)
  }, [])
  useEffect(() => {
    loadImagens()
  }, [loadImagens])
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile) {
      alert('Selecione uma imagem')
      return
    }

    setUploading(true)

    const body = new FormData()
    body.append('file', selectedFile)
    body.append('tipo', form.tipo)
    if (form.titulo) body.append('titulo', form.titulo)
    if (form.subtitulo) body.append('subtitulo', form.subtitulo)
    if (form.link) body.append('link', form.link)
    body.append('ordem', String(imagens.length))
    const res = await fetch('/api/upload', { method: 'POST', body })

    setUploading(false)

    if (!res.ok) {
      const { error } = await res.json()
      alert('Erro ao fazer upload: ' + error)
      return
    }

    setForm({ tipo: 'carousel', titulo: '', subtitulo: '', link: '' })
    setSelectedFile(null)
    loadImagens()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta imagem? O arquivo será removido do servidor.')) return

    setDeletingId(id)
    const res = await fetch('/api/imagens', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setDeletingId(null)

    if (!res.ok) {
      const { error } = await res.json()
      alert('Erro ao excluir: ' + error)
      return
    }
    loadImagens()
  }

  const handleToggleActive = async (img: SiteImagem) => {
    setTogglingId(img.id)
    await fetch('/api/imagens', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: img.id, ativo: !img.ativo }),
    })
    setTogglingId(null)
    loadImagens()
  }

  const handleMoveOrder = async (id: string, direction: 'up' | 'down') => {
    const sorted = [...imagens]
    const idx = sorted.findIndex((i) => i.id === id)
    if (idx === -1) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return

    const current = sorted[idx]
    const swap = sorted[swapIdx]

    const temp = current.ordem
    current.ordem = swap.ordem
    swap.ordem = temp

    await Promise.all([
      fetch('/api/imagens', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: current.id, ordem: current.ordem }),
      }),
      fetch('/api/imagens', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: swap.id, ordem: swap.ordem }),
      }),
    ])

    loadImagens()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-marinho mb-6">Imagens do Site</h1>

      <form onSubmit={handleSubmit} className="bg-branco rounded-xl border border-bege/20 p-6 mb-8">
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
              className="flex h-11 w-full rounded-lg border border-bege/20 bg-branco px-3 py-2 text-sm text-marinho focus:outline-none focus:ring-2 focus:ring-safety"
            >
              {tipos.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-marinho mb-1">
              Título
            </label>
            <Input
              value={form.titulo}
              onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
              placeholder="Título da imagem"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-marinho mb-1">
              Subtítulo
            </label>
            <Input
              value={form.subtitulo}
              onChange={(e) => setForm((f) => ({ ...f, subtitulo: e.target.value }))}
              placeholder="Subtítulo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-marinho mb-1">
              Link
            </label>
            <Input
              value={form.link}
              onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
              placeholder="/produtos ou URL"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-marinho mb-1">
              Imagem Desktop *
            </label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="flex h-11 w-full rounded-lg border border-bege/20 bg-branco px-3 py-2 text-sm text-marinho file:border-0 file:bg-transparent file:text-sm file:font-medium focus:outline-none focus:ring-2 focus:ring-safety"
            />
            {selectedFile && (
              <p className="text-xs text-safety mt-1">
                Selecionado: {selectedFile.name}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading || !selectedFile}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-safety text-marinho px-6 py-2.5 text-sm font-medium hover:bg-safety/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Upload size={16} />
          {uploading ? 'Enviando...' : 'Enviar Imagem'}
        </button>
      </form>

      {loading && (
        <div className="text-center py-8 text-bege">Carregando...</div>
      )}

      {!loading &&
        tipos.map((tipo) => {
          const filtered = imagens.filter((i) => i.tipo === tipo.value)
          if (filtered.length === 0) return null
          return (
            <div key={tipo.value} className="bg-branco rounded-xl border border-bege/20 p-6 mb-6">
              <h3 className="text-lg font-bold text-marinho mb-4">
                {tipo.label}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((img, index) => (
                  <div
                    key={`${img.id}-${index}`}
                    className={`relative group rounded-lg overflow-hidden border ${
                      img.ativo ? 'border-bege/20' : 'border-red-300/40 opacity-60'
                    }`}
                  >
                    <div className="aspect-video bg-bege/10">
                      <img
                        src={img.url}
                        alt={img.titulo || ''}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            img.ativo ? 'bg-green-500' : 'bg-red-400'
                          }`}
                        />
                        <span className="text-xs text-bege">
                          {img.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
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
                      <p className="text-xs text-bege/60 mt-1">
                        Ordem: {img.ordem}
                      </p>
                      <button
                        onClick={() => setEditingImage(img)}
                        className="mt-2 px-3 py-1.5 rounded-lg bg-azul/80 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-azul font-medium flex items-center gap-1.5 w-full justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        Editar
                      </button>
                    </div>

                    <div className="absolute top-2 left-2 flex gap-1">
                      <button
                        onClick={() => handleMoveOrder(img.id, 'up')}
                        disabled={filtered.indexOf(img) === 0}
                        className="p-1.5 rounded-lg bg-marinho/60 text-branco opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 hover:bg-marinho/80"
                        title="Mover para cima" >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => handleMoveOrder(img.id, 'down')}
                        disabled={filtered.indexOf(img) === filtered.length - 1}
                        className="p-1.5 rounded-lg bg-marinho/60 text-branco opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 hover:bg-marinho/80"
                        title="Mover para baixo"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>

                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        onClick={() => handleToggleActive(img)}
                        disabled={togglingId === img.id}
                        className={`p-1.5 rounded-lg transition-opacity ${
                          img.ativo
                            ? 'bg-amber-500/80 text-white'
                            : 'bg-green-500/80 text-white'
                        } opacity-0 group-hover:opacity-100 hover:opacity-100 disabled:opacity-50`}
                        title={img.ativo ? 'Desativar' : 'Ativar'}
                      >
                        {img.ativo ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button
                        onClick={() => handleDelete(img.id)}
                        disabled={deletingId === img.id}
                        className="p-1.5 rounded-lg bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 hover:bg-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
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
      <EditImageModal
        image={editingImage}
        onClose={() => setEditingImage(null)}
        onSaved={loadImagens}
      />
    </div>
  )
}
