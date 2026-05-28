'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import type { SiteImagem } from '@/types'

export function HeroCarousel() {
  const [slides, setSlides] = useState<SiteImagem[]>([])
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) return
    supabase
      .from('site_imagens')
      .select('*')
      .eq('tipo', 'carousel')
      .eq('ativo', true)
      .order('ordem')
      .then(({ data }) => {
        if (data && data.length > 0) setSlides(data)
      })
  }, [])

  const defaultSlides = [
    {
      url: '',
      titulo: 'Tecnologia em Cada Passo',
      subtitulo: 'Calçados profissionais com a mais alta tecnologia em segurança e conforto para o seu dia a dia.',
      link: '/produtos',
      gradiente: 'from-marinho via-azul to-marinho',
    },
    {
      url: '',
      titulo: 'Kit Starter Prado',
      subtitulo: 'Comece com 30 pares e tenha reposição garantida direto da fábrica. Sem estoque encalhado.',
      link: '/parceiro',
      gradiente: 'from-country via-marinho to-marinho',
    },
    {
      url: '',
      titulo: 'Tradição desde 1994',
      subtitulo: 'Mais de 30 anos calçando profissionais que pisam firme. Conheça nossa história.',
      link: '/sobre',
      gradiente: 'from-azul via-marinho to-marinho',
    },
  ]

  const displaySlides = slides.length > 0 ? slides : defaultSlides
  const activeSlide = displaySlides[current]

  useEffect(() => {
    if (displaySlides.length <= 1) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % displaySlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [displaySlides.length])

  const prev = () =>
    setCurrent((c) => (c - 1 + displaySlides.length) % displaySlides.length)
  const next = () => setCurrent((c) => (c + 1) % displaySlides.length)

  const isDefault = slides.length === 0

  return (
    <div className="relative w-full h-[70vh] min-h-[400px] max-h-[700px] overflow-hidden bg-marinho">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          {activeSlide.url ? (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${activeSlide.url})`,
                backgroundColor: '#1C2632',
              }}
            />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${isDefault ? (activeSlide as any).gradiente : 'from-marinho via-azul to-marinho'}`} />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-marinho/80 to-marinho/30" />
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
                <Link href={activeSlide.link}>
                  <Button variant="primary" size="lg">
                    {(activeSlide as any).cta_texto || 'Saiba mais'}
                  </Button>
                </Link>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

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
        {displaySlides.map((_, i) => (
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
    </div>
  )
}
