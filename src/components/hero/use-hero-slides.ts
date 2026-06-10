'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { HeroSlide } from './types'

// Fallback palette for gradients when DB doesn't have color info
const FALLBACK_GRADIENTS = [
  { from: '#1C2632', to: '#2C3B4E' },  // marinho → azul
  { from: '#9F5234', to: '#7A3F28' },  // country
  { from: '#2C3B4E', to: '#1C2632' },  // azul → marinho
]

function mapSiteImagemToHeroSlide(item: any, index: number): HeroSlide {
  return {
    id: index,
    title: item.titulo || 'Produto Prado',
    subtitle: item.subtitulo || '',
    description: item.descricao || item.subtitulo || '',
    image: item.url,
    backgroundColor: FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length].from,
    gradientFrom: FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length].from,
    gradientTo: FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length].to,
    buttonText: item.cta_texto || 'Saiba mais',
    buttonLink: item.link || '/produtos',
    storagePath: item.storage_path || null,
    urlMobile: item.url_mobile || null,
  }
}

export function useHeroSlides() {
  const [slides, setSlides] = useState<HeroSlide[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) {
      setLoading(false)
      setError('Supabase não configurado')
      return
    }

    let cancelled = false

    ;(async () => {
      try {
        const { data, error: queryError } = await supabase
          .from('site_imagens')
          .select('*')
          .eq('tipo', 'carousel')
          .eq('ativo', true)
          .order('ordem')

        if (cancelled) return

        if (queryError) {
          console.error('useHeroSlides: erro na query', queryError)
          setError('Erro ao carregar slides')
          setLoading(false)
          return
        }

        if (data && data.length > 0) {
          setSlides(data.map((item: any, i: number) => mapSiteImagemToHeroSlide(item, i)))
        }
        setLoading(false)
      } catch (err) {
        if (cancelled) return
        console.error('useHeroSlides: erro inesperado', err)
        setError('Erro ao carregar slides')
        setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return { slides, loading, error }
}
