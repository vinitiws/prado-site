'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import type { SiteImagem } from '@/types'

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    setIsMobile(mq.matches)

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [breakpoint])

  return isMobile
}

export function HeroCarousel() {
  const [slides, setSlides] = useState<SiteImagem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [current, setCurrent] = useState(0)
  const isMobile = useIsMobile(768)

  useEffect(() => {
    const supabase = createClient()

    if (!supabase) {
      console.error('HeroCarousel: Supabase client não inicializado')
      setError('Erro ao conectar com o banco de dados')
      setLoading(false)
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
          console.error('HeroCarousel: Erro ao buscar imagens:', queryError)
          setError('Erro ao carregar imagens do carousel')
          setLoading(false)
          return
        }

        if (data && data.length > 0) {
          console.log(`HeroCarousel: ${data.length} imagens carregadas`)
          setSlides(data)
        } else {
          console.warn('HeroCarousel: Nenhuma imagem encontrada no banco de dados')
        }

        setLoading(false)
      } catch (err) {
        if (cancelled) return
        console.error('HeroCarousel: Erro inesperado:', err)
        setError('Erro ao carregar carousel')
        setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  const prev = useCallback(() =>
    setCurrent((c) => (c - 1 + slides.length) % slides.length), [slides.length])
  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [slides.length])

  if (loading) {
    return (
      <div className="relative w-full h-[70vh] min-h-[400px] max-h-[700px] bg-marinho animate-pulse" />
    )
  }

  if (error) {
    return (
      <div className="relative w-full h-[70vh] min-h-[400px] max-h-[700px] bg-marinho flex items-center justify-center">
        <div className="text-center text-branco">
          <p className="text-xl mb-2">⚠️ {error}</p>
          <p className="text-sm text-bege">Verifique o console para mais detalhes</p>
        </div>
      </div>
    )
  }

  if (slides.length === 0) {
    return (
      <div className="relative w-full h-[70vh] min-h-[400px] max-h-[700px] bg-marinho flex items-center justify-center">
        <div className="text-center text-branco">
          <p className="text-xl mb-2">📷 Nenhuma imagem no carousel</p>
          <p className="text-sm text-bege">Adicione imagens do tipo &ldquo;carousel&rdquo; no banco de dados</p>
        </div>
      </div>
    )
  }

  const activeSlide = slides[current]

  // Resolve mobile image with fallback
  const mobileImageSrc = activeSlide.url_mobile || activeSlide.url
  const isFirstSlide = current === 0

  return (
    <div className="relative w-full h-[100vh] min-h-[400px] max-h-[700px] overflow-hidden bg-marinho">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          {/* Desktop image - hidden on mobile */}
          <div className="hidden md:block absolute inset-0">
            <Image
              src={activeSlide.url}
              alt={activeSlide.titulo || 'Slide do carousel'}
              fill
              sizes="100vw"
              className="object-cover"
              preload={isFirstSlide && !isMobile}
              loading={isFirstSlide && !isMobile ? undefined : 'lazy'}
            />
          </div>

          {/* Mobile image - hidden on desktop */}
          <div className="block md:hidden absolute inset-0">
            <Image
              src={mobileImageSrc}
              alt={activeSlide.titulo || 'Slide do carousel'}
              fill
              sizes="100vw"
              className="object-cover object-center" // usar object-conver para ter imagem boa, mas pode cortar um pouco.
              preload={isFirstSlide && isMobile}
              loading={isFirstSlide && isMobile ? undefined : 'lazy'}
            />
          </div>

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-marinho/0 to-marinho/0" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex h-full items-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${current}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {activeSlide.titulo && (
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-branco mb-4">
                  {activeSlide.titulo}
                </h2>
              )}
              {activeSlide.subtitulo && (
                <p className="text-lg sm:text-xl text-bege mb-8 max-w-lg">
                  {activeSlide.subtitulo}
                </p>
              )}
              {activeSlide.link && (
                <Button variant="primary" size="lg" asChild>
                  <Link href={activeSlide.link}>
                    Saiba mais
                  </Link>
                </Button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-branco/10 hover:bg-branco/20 text-branco transition-colors"
            aria-label="Slide anterior"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-branco/10 hover:bg-branco/20 text-branco transition-colors"
            aria-label="Próximo slide"
          >
            <ChevronRight size={24} />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === current ? 'bg-safety w-8' : 'bg-branco/40'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
