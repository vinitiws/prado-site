'use client'

import { useState } from 'react'
import { X, Upload } from 'lucide-react'
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  if (!image) return null

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setSaving(true)

    try {
      if (selectedFile) {
        // Upload new image + update text
        const body = new FormData()
        body.append('file', selectedFile)
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
        // Only update text
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
      <div className="bg-branco rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-marinho">Editar Imagem</h2>
          <button onClick={onClose} className="p-1 hover:bg-bege/10 rounded-lg">
            <X size={20} className="text-bege" />
          </button>
        </div>

        <div className="aspect-video bg-bege/10 rounded-lg overflow-hidden mb-4">
          <img
            src={preview || image.url}
            alt={image.titulo || ''}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-marinho mb-1">
              {selectedFile ? 'Nova imagem selecionada' : 'Substituir imagem'}
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-azul hover:text-azul/80">
              <Upload size={16} />
              <span>{selectedFile ? selectedFile.name : 'Selecionar arquivo'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>

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
