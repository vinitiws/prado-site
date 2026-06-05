'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Upload, Smartphone, Monitor } from 'lucide-react'
import type { SiteImagem } from '@/types'
import { EditImageModal } from '@/components/admin/edit-image-modal'
import type { SupabaseClient } from '@supabase/supabase-js'

const supabaseClient = createClient()

const tipos = [
  { value: 'carousel' as const, label: 'Carousel (Hero)' },
  { value: 'card' as const, label: 'Card de Categoria' },
  { value: 'banner' as const, label: 'Banner' },
]

// Helper to format a file as a data URL for preview
function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.readAsDataURL(file)
  })
}

export default function AdminImagensPage() {
  const supabaseRef = useRef<SupabaseClient | null>(supabaseClient)
  const [imagens, setImagens] = useState<SiteImagem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  // Desktop file states
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  // Mobile file states
  const [selectedMobileFile, setSelectedMobileFile] = useState<File | null>(null)
  const [mobilePreview, setMobilePreview] = useState<string | null>(null)

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

  const handleDesktopFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    const dataUrl = await readFileAsDataURL(file)
    setPreview(dataUrl)
  }

  const handleMobileFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedMobileFile(file)
    const dataUrl = await readFileAsDataURL(file)
    setMobilePreview(dataUrl)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      alert('Selecione a imagem Desktop')
      return
    }

    setUploading(true)

    const body = new FormData()
    body.append('file', selectedFile)
    if (selectedMobileFile) body.append('mobile_file', selectedMobileFile)
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
    setPreview(null)
    setSelectedMobileFile(null)
    setMobilePreview(null)
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
          <div>
            <label htmlFor="subtitulo" className="block text-sm font-medium text-marinho mb-1">
              Subtítulo
            </label>
            <input
              id="subtitulo"
              value={form.subtitulo}
              onChange={(e) => setForm((f) => ({ ...f, subtitulo: e.target.value }))}
              className="flex h-11 w-full rounded-lg border border-bege bg-branco px-4 py-2 text-sm text-marinho focus:outline-none focus:ring-2 focus:ring-safety placeholder:text-bege/70"
            />
          </div>
          <Input
            id="link"
            label="Link"
            value={form.link}
            onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
            placeholder="https://..."
          />
        </div>

        {/* Desktop and Mobile upload fields side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          {/* Desktop Image Upload */}
          <div className="border border-bege/20 rounded-lg p-4 bg-bege/5">
            <div className="flex items-center gap-2 mb-3">
              <Monitor size={18} className="text-marinho" />
              <h3 className="text-sm font-bold text-marinho">Imagem Desktop</h3>
            </div>

            {preview && (
              <div className="aspect-video bg-bege/10 rounded-lg overflow-hidden mb-3">
                <img
                  src={preview}
                  alt="Preview Desktop"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <label className="flex items-center gap-2 cursor-pointer text-sm text-azul hover:text-azul/80 mb-2">
              <Upload size={16} />
              <span>{selectedFile ? selectedFile.name : 'Selecionar imagem desktop'}</span>
              <input
                type="file"
                accept="image/webp,image/jpeg,image/png"
                onChange={handleDesktopFileSelect}
                className="hidden"
              />
            </label>

            <p className="text-xs text-bege/60">
              Desktop recomendado: <strong>1920x800</strong>
            </p>
            <p className="text-xs text-bege/60">
              Formatos: webp, jpg, png
            </p>
          </div>

          {/* Mobile Image Upload */}
          <div className="border border-bege/20 rounded-lg p-4 bg-bege/5">
            <div className="flex items-center gap-2 mb-3">
              <Smartphone size={18} className="text-marinho" />
              <h3 className="text-sm font-bold text-marinho">Imagem Mobile</h3>
              <span className="text-xs text-bege/60 font-normal">(opcional)</span>
            </div>

            {mobilePreview && (
              <div className="aspect-[4/5] bg-bege/10 rounded-lg overflow-hidden mb-3 max-w-[200px]">
                <img
                  src={mobilePreview}
                  alt="Preview Mobile"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <label className="flex items-center gap-2 cursor-pointer text-sm text-azul hover:text-azul/80 mb-2">
              <Upload size={16} />
              <span>{selectedMobileFile ? selectedMobileFile.name : 'Selecionar imagem mobile'}</span>
              <input
                type="file"
                accept="image/webp,image/jpeg,image/png"
                onChange={handleMobileFileSelect}
                className="hidden"
              />
            </label>

            <p className="text-xs text-bege/60">
              Mobile recomendado: <strong>1080x1350</strong>
            </p>
            <p className="text-xs text-bege/60">
              Formatos: webp, jpg, png
            </p>
            <p className="text-xs text-bege/40 mt-1">
              Se não informada, a imagem desktop será usada como fallback.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-safety text-marinho font-bold hover:bg-safety/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload size={18} />
          {uploading ? 'Enviando...' : 'Adicionar Imagem'}
        </button>
      </form>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tipos.map((t) => (
          <button
            key={t.value}
            onClick={() => {}}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-bege/20 bg-branco text-marinho"
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-safety border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-bege">Carregando imagens...</p>
        </div>
      )}

      {!loading && (
        <>
          {tipos.map((tipo) => {
            const filtered = imagens.filter((i) => i.tipo === tipo.value)
            if (filtered.length === 0) return null

            return (
              <div key={tipo.value} className="mb-8">
                <h3 className="text-lg font-bold text-marinho mb-3">{tipo.label}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filtered.map((img) => (
                    <div
                      key={img.id}
                      className={`relative group rounded-lg overflow-hidden border ${
                        img.ativo ? 'border-bege/20' : 'border-red-300/40 opacity-60'
                      }`}
                    >
                      {/* Desktop thumbnail */}
                      <div className="aspect-video bg-bege/10">
                        <img
                          src={img.url}
                          alt={img.titulo || ''}
                          className="w-full h-full object-cover"
                        />
                        {/* Mobile badge */}
                        {img.url_mobile && (
                          <div className="absolute top-2 left-2 bg-marinho/70 text-branco text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Smartphone size={10} />
                            Mobile
                          </div>
                        )}
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

                        {/* Mobile thumbnail preview */}
                        {img.url_mobile && (
                          <div className="mt-2 flex items-center gap-2">
                            <div className="w-8 h-10 rounded overflow-hidden bg-bege/10 flex-shrink-0">
                              <img
                                src={img.url_mobile}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-[10px] text-bege/60">Imagem mobile</span>
                          </div>
                        )}

                        <button
                          onClick={() => setEditingImage(img)}
                          className="mt-2 px-3 py-1.5 rounded-lg bg-azul/80 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-azul font-medium flex items-center gap-1.5 w-full justify-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                          Editar
                        </button>
                      </div>

                      <div className="absolute top-2 left-2 flex gap-1" style={{ top: 'auto', bottom: '50%' }}>
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
        </>
      )}

      {!loading && imagens.length === 0 && (
        <p className="text-bege text-center py-8">
          Nenhuma imagem cadastrada ainda.
        </p>
      )}

      <EditImageModal
        image={editingImage}
        onClose={() => {
          setEditingImage(null)
          setSelectedFile(null)
          setPreview(null)
          setSelectedMobileFile(null)
          setMobilePreview(null)
        }}
        onSaved={loadImagens}
      />
    </div>
  )
}
