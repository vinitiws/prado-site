'use client'

import { useState, forwardRef, useImperativeHandle } from 'react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { X, Upload } from 'lucide-react'

interface ImageItem {
  id: string
  url: string
  ordem: number
}

interface ProductImageUploadProps {
  existingImages?: ImageItem[]
  maxImages?: number
}

export interface ProductImageUploadHandle {
  uploadNewImages: (produtoId: string) => Promise<boolean>
  hasNewImages: boolean
}

export const ProductImageUpload = forwardRef<ProductImageUploadHandle, ProductImageUploadProps>(
  function ProductImageUpload({ existingImages = [], maxImages = 3 }, ref) {
    const [files, setFiles] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>([])
    const [existing, setExisting] = useState<ImageItem[]>(existingImages)
    const [uploading, setUploading] = useState(false)

    const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files || [])
      const total = existing.length + files.length + selected.length
      if (total > maxImages) {
        alert(`Máximo de ${maxImages} imagens por produto`)
        return
      }
      const updated = [...files, ...selected]
      setFiles(updated)
      selected.forEach((f) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreviews((p) => [...p, reader.result as string])
        }
        reader.readAsDataURL(f)
      })
      e.target.value = ''
    }

    const removeNew = (idx: number) => {
      setFiles((p) => p.filter((_, i) => i !== idx))
      setPreviews((p) => p.filter((_, i) => i !== idx))
    }

    const removeExisting = async (img: ImageItem) => {
      if (!confirm('Remover esta imagem?')) return
      setUploading(true)
      try {
        const res = await fetch('/api/produtos/imagens', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageId: img.id }),
        })
        if (!res.ok) {
          const err = await res.json()
          alert('Erro: ' + (err.error || 'Erro desconhecido'))
          return
        }
        setExisting((p) => p.filter((x) => x.id !== img.id))
      } catch (err) {
        console.error(err)
        alert('Erro ao remover imagem')
      } finally {
        setUploading(false)
      }
    }

    useImperativeHandle(ref, () => ({
      uploadNewImages: async (produtoId: string): Promise<boolean> => {
        if (files.length === 0) return true
        setUploading(true)
        try {
          const formData = new FormData()
          for (const file of files) {
            formData.append('files', file)
          }

          const res = await fetch(`/api/produtos/${produtoId}/imagens`, {
            method: 'POST',
            body: formData,
          })

          if (!res.ok) {
            const err = await res.json()
            alert('Upload: ' + (err.error || 'Erro desconhecido'))
            setUploading(false)
            return false
          }

          setFiles([])
          setPreviews([])
          setUploading(false)
          return true
        } catch (err) {
          console.error(err)
          setUploading(false)
          return false
        }
      },
      get hasNewImages() { return files.length > 0 },
    }))

    const total = existing.length + files.length
    const canAdd = total < maxImages

    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-marinho">
          Imagens do Produto <span className="text-bege">(até {maxImages})</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {existing.map((img) => (
            <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border-2 border-bege group">
              <Image src={img.url} alt="" fill className="object-cover" sizes="200px" />
              <button type="button" onClick={() => removeExisting(img)} disabled={uploading}
                className="absolute top-1 right-1 p-1.5 bg-red-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50">
                <X size={14} />
              </button>
            </div>
          ))}
          {previews.map((p, i) => (
            <div key={`new-${i}`} className="relative aspect-square rounded-lg overflow-hidden border-2 border-safety">
              <img src={p} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => removeNew(i)}
                className="absolute top-1 right-1 p-1.5 bg-red-500/90 text-white rounded-full">
                <X size={14} />
              </button>
            </div>
          ))}
          {canAdd && (
            <div className="aspect-square rounded-lg border-2 border-dashed border-bege flex items-center justify-center bg-bege/5 hover:bg-bege/10 transition-colors cursor-pointer">
              <label htmlFor="product-image-input" className="cursor-pointer flex flex-col items-center gap-2 p-4">
                <Upload size={24} className="text-bege" />
                <span className="text-xs text-bege text-center">Adicionar<br />imagem</span>
              </label>
            </div>
          )}
        </div>
        <input id="product-image-input" type="file" accept="image/*" multiple onChange={handleSelect} className="hidden" />
        <p className="text-xs text-bege">{total} de {maxImages} imagens</p>
      </div>
    )
  }
)
