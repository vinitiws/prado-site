'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'
import type { SiteImagem } from '@/types'

interface PromotionalBannerProps {
  tipo: string
  className?: string
  desktopHeight?: string
  mobileHeight?: string
}

export function PromotionalBanner({
  tipo,
  className = '',
  desktopHeight = 'h-[400px]',
  mobileHeight = 'h-[250px]',
}: PromotionalBannerProps) {
  const [banners, setBanners] = useState<SiteImagem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    if (!supabase) {
      console.error('PromotionalBanner: Supabase client não inicializado')
      setLoading(false)
      return
    }

    let cancelled = false

    ;(async () => {
      try {
        const { data, error: queryError } = await supabase
          .from('site_imagens')
          .select('*')
          .eq('tipo', tipo)
          .eq('ativo', true)
          .order('ordem')

        if (cancelled) return

        if (queryError) {
          console.error('PromotionalBanner: Erro ao buscar imagens:', queryError)
          setLoading(false)
          return
        }

        if (data && data.length > 0) {
          console.log(`PromotionalBanner (${tipo}): ${data.length} banner(s) carregado(s)`)
          setBanners(data)
        } else {
          console.warn(`PromotionalBanner: Nenhum banner encontrado para tipo "${tipo}"`)
        }

        setLoading(false)
      } catch (err) {
        if (cancelled) return
        console.error('PromotionalBanner: Erro inesperado:', err)
        setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [tipo])

  if (loading) {
    return (
      <div className={`w-full ${desktopHeight} ${mobileHeight} md:${desktopHeight} bg-bege/10 animate-pulse ${className}`} />
    )
  }

  if (banners.length === 0) {
    return null
  }

  return (
    <div className={`w-full ${className}`}>
      {banners.map((banner) => {
        const content = (
          <div className={`relative w-full ${mobileHeight} md:${desktopHeight} overflow-hidden`}>
            <Image
              src={banner.url}
              alt={banner.titulo || 'Banner promocional'}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          </div>
        )

        if (banner.link) {
          return (
            <Link key={banner.id} href={banner.link} className="block w-full">
              {content}
            </Link>
          )
        }

        return <div key={banner.id}>{content}</div>
      })}
    </div>
  )
}
