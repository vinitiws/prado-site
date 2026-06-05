'use client'

import { useState } from 'react'
import { X, Upload, Monitor, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { SiteImagem } from '@/types'

interface EditImageModalProps {
  image: SiteImagem | null
  onClose: () => void
  onSaved: () => void
}

export function EditImageModal({ image, onClose, onSaved }: EditImageModalProps) {
  const [titulo, setTitulo] = useState(image?.titulo || '')
  const [subtitulo, setSubtitulo] = useState(image?.subtitulo || '')
  const [link, setLink] = useState(image?.link || '')
  const [saving, setSaving] = useState(false)

  // Desktop file
  const [desktopFile, setDesktopFile] = useState<File | null>(null)
  const [desktopPreview, setDesktopPreview] = useState<string | null>(null)

  // Mobile file
  const [mobileFile, setMobileFile] = useState<File | null>(null)
  const [mobilePreview, setMobilePreview] = useState<string | null>(null)

  if (!image) return null

  const handleDesktopFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setDesktopFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setDesktopPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleMobileFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setMobileFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setMobilePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setSaving(true)

    try {
      const hasDesktopFile = !!desktopFile
      const hasMobileFile = !!mobileFile
      const hasAnyFile = hasDesktopFile || hasMobileFile

      if (hasAnyFile) {
        const body = new FormData()

        // Always send at least one file
        if (desktopFile) {
          body.append('file', desktopFile)
        }
        if (mobileFile) {
          body.append('mobile_file', mobileFile)
        }

        body.append('tipo', image.tipo)
        body.append('id', image.id)
        body.append('titulo', titulo)
        body.append('subtitulo', subtitulo)
        body.append('link', link)

        const res = await fetch('/api/upload', { method: 'POST', body })
        if (!res.ok) {
          const { error } = await res.json()
          alert('Erro: ' + error)
          setSaving(false)
          return
        }
      } else {
        // Only update text metadata
        const res = await fetch('/api/imagens', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: image.id,
            titulo: titulo || null,
            subtitulo: subtitulo || null,
            link: link || null,
          }),
        })
        if (!res.ok) {
          const { error } = await res.json()
          alert('Erro: ' + error)
          setSaving(false)
          return
        }
      }

      setSaving(false)
      onSaved()
      onClose()
    } catch {
      alert('Erro ao salvar. Tente novamente.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-branco rounded-xl p-6 max-w-2xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-marinho">Editar Imagem</h2>
          <button onClick={onClose} className="p-1 hover:bg-bege/10 rounded-lg">
            <X size={20} className="text-bege" />
          </button>
        </div>

        {/* Desktop image preview and upload */}
        <div className="mb-4 border border-bege/20 rounded-lg p-4 bg-bege/5">
          <div className="flex items-center gap-2 mb-3">
            <Monitor size={16} className="text-marinho" />
            <h3 className="text-sm font-bold text-marinho">Imagem Desktop</h3>
          </div>

          <div className="aspect-video bg-bege/10 rounded-lg overflow-hidden mb-3">
            <img
              src={desktopPreview || image.url}
              alt={image.titulo || ''}
              className="w-full h-full object-cover"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-sm text-azul hover:text-azul/80">
            <Upload size={16} />
            <span>
              {desktopFile
                ? desktopFile.name
                : 'Substituir imagem desktop'}
            </span>
            <input
              type="file"
              accept="image/webp,image/jpeg,image/png"
              onChange={handleDesktopFileSelect}
              className="hidden"
            />
          </label>
          <p className="text-xs text-bege/40 mt-1">
            Deixe vazio para manter a imagem desktop atual.
          </p>
        </div>

        {/* Mobile image preview and upload */}
        <div className="mb-4 border border-bege/20 rounded-lg p-4 bg-bege/5">
          <div className="flex items-center gap-2 mb-3">
            <Smartphone size={16} className="text-marinho" />
            <h3 className="text-sm font-bold text-marinho">Imagem Mobile</h3>
            <span className="text-xs text-bege/60 font-normal">(opcional)</span>
          </div>

          <div className="aspect-[4/5] bg-bege/10 rounded-lg overflow-hidden mb-3 max-w-[200px]">
            <img
              src={mobilePreview || image.url_mobile || image.url}
              alt={image.titulo || ''}
              className="w-full h-full object-cover"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-sm text-azul hover:text-azul/80">
            <Upload size={16} />
            <span>
              {mobileFile
                ? mobileFile.name
                : image.url_mobile
                  ? 'Substituir imagem mobile'
                  : 'Adicionar imagem mobile'}
            </span>
            <input
              type="file"
              accept="image/webp,image/jpeg,image/png"
              onChange={handleMobileFileSelect}
              className="hidden"
            />
          </label>
          <p className="text-xs text-bege/40 mt-1">
            Se não selecionar nova imagem, a atual será mantida.
          </p>
        </div>

        <div className="space-y-4">
          <Input
            id="edit-titulo"
            label="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />

          <div>
            <label htmlFor="edit-subtitulo" className="block text-sm font-medium text-marinho mb-1">
              Subtítulo
            </label>
            <input
              id="edit-subtitulo"
              value={subtitulo}
              onChange={(e) => setSubtitulo(e.target.value)}
              className="flex h-11 w-full rounded-lg border border-bege bg-branco px-4 py-2 text-sm text-marinho focus:outline-none focus:ring-2 focus:ring-safety placeholder:text-bege/70"
            />
          </div>

          <Input
            id="edit-link"
            label="Link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://..."
          />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
