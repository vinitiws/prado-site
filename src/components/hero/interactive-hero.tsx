'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { HeroNavbar } from './hero-navbar'
import { HeroThumbnails } from './hero-thumbnails'
import { useHeroSlides } from './use-hero-slides'
import { heroSlides as fallbackSlides } from './slides-data'
import type { HeroSlide } from './types'

/* ------------------------------------------------------------------ */
/*  Loading skeleton                                                   */
/* ------------------------------------------------------------------ */
function HeroSkeleton() {
  return (
    <div className="relative w-full min-h-screen bg-marinho flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-safety/30 border-t-safety rounded-full animate-spin" />
        <p className="text-bege/60 text-sm">Carregando...</p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  HeroContent – left side text + CTA                                */
/* ------------------------------------------------------------------ */
function HeroContent({
  slide,
  containerRef,
}: {
  slide: HeroSlide
  containerRef: React.RefObject<HTMLDivElement | null>
}) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLSpanElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline({ paused: true })
    tl.fromTo(
      subtitleRef.current,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
    )
      .fromTo(
        titleRef.current,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
        '-=0.3'
      )
      .fromTo(
        descRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
        '-=0.3'
      )
      .fromTo(
        buttonRef.current,
        { scale: 0.85, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' },
        '-=0.2'
      )
    tl.play()
    return () => { tl.kill() }
  }, [slide])

  return (
    <div ref={containerRef} className="flex flex-col justify-center h-full max-w-lg">
      <span
        ref={subtitleRef}
        className="inline-block text-safety font-medium text-sm sm:text-base tracking-[0.2em] uppercase mb-3"
      >
        {slide.subtitle}
      </span>
      <h1
        ref={titleRef}
        className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-branco leading-[1.05] mb-4"
      >
        {slide.title}
      </h1>
      <p
        ref={descRef}
        className="text-base sm:text-lg text-branco/70 leading-relaxed mb-8 max-w-md"
      >
        {slide.description}
      </p>
      <div ref={buttonRef}>
        <a
          href={slide.buttonLink}
          className="inline-flex items-center gap-2 bg-safety text-marinho font-semibold px-8 py-4 rounded-lg text-base hover:bg-safety/90 transition-all duration-300 shadow-lg shadow-safety/20"
        >
          {slide.buttonText}
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  HeroProduct – right side image + shadow + float                   */
/* ------------------------------------------------------------------ */
function HeroProduct({ slide: { image, title } }: { slide: HeroSlide }) {
  const imageRef = useRef<HTMLDivElement>(null)
  const shadowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline({ paused: true })
    tl.fromTo(
      shadowRef.current,
      { scaleX: 0, opacity: 0 },
      { scaleX: 1, opacity: 1, duration: 0.6, ease: 'power3.out' },
      0.2
    ).fromTo(
      imageRef.current,
      { x: 120, opacity: 0, rotateY: 15 },
      { x: 0, opacity: 1, rotateY: 0, duration: 1, ease: 'power4.out' },
      0.1
    )
    tl.play()

    gsap.to(imageRef.current, {
      y: -10,
      duration: 3,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    })

    return () => {
      tl.kill()
      gsap.killTweensOf(imageRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="relative flex items-center justify-center h-full w-full">
      <div
        ref={shadowRef}
        className="absolute bottom-[15%] left-1/2 -translate-x-1/2 w-[70%] h-6 bg-black/30 rounded-full blur-xl"
      />
      <div
        ref={imageRef}
        className="relative w-full h-full flex items-center justify-center"
        style={{ perspective: '1000px' }}
      >
        <div className="relative w-[85%] h-[85%] max-w-[500px] max-h-[500px]">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 80vw, 50vw"
            className="object-contain drop-shadow-2xl"
            priority
            unoptimized
          />
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Background overlay manager (gradient + shapes)                    */
/* ------------------------------------------------------------------ */
function useBgShapes(heroRef: React.RefObject<HTMLDivElement | null>, current: number) {
  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return
    const old = hero.querySelectorAll('.bg-shape')
    old.forEach((s) => s.remove())

    const specs = [
      { size: 300, x: '5%', y: '10%', blur: '120px', opacity: 0.12, delay: 0 },
      { size: 200, x: '70%', y: '5%', blur: '100px', opacity: 0.08, delay: 0.2 },
      { size: 250, x: '80%', y: '60%', blur: '90px', opacity: 0.1, delay: 0.1 },
    ]
    specs.forEach((s) => {
      const el = document.createElement('div')
      el.className = 'bg-shape'
      el.style.cssText = `
        position:absolute;width:${s.size}px;height:${s.size}px;
        left:${s.x};top:${s.y};border-radius:50%;
        background:radial-gradient(circle,rgba(255,255,255,0.15) 0%,transparent 70%);
        filter:blur(${s.blur});pointer-events:none;z-index:0;opacity:0;
      `
      hero.appendChild(el)
      gsap.to(el, { opacity: s.opacity, duration: 1.5, delay: s.delay, ease: 'power2.out' })
    })
    return () => {
      hero.querySelectorAll('.bg-shape').forEach((s) => s.remove())
    }
  }, [current, heroRef])
}

/* ------------------------------------------------------------------ */
/*  InteractiveHero — main orchestrator                               */
/* ------------------------------------------------------------------ */
export function InteractiveHero() {
  const { slides: dbSlides, loading, error } = useHeroSlides()

  // Usa dados do Supabase ou fallback estático se não tiver ou der erro
  const slides = dbSlides && dbSlides.length > 0 ? dbSlides : fallbackSlides

  const [current, setCurrent] = useState(0)
  const [transitionState, setTransitionState] = useState<'idle' | 'exiting' | 'entering'>('idle')
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const heroRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const oldContentRef = useRef<HTMLDivElement>(null)
  const oldProductRef = useRef<HTMLDivElement>(null)
  const newContentRef = useRef<HTMLDivElement>(null)
  const newProductRef = useRef<HTMLDivElement>(null)

  const slide = slides[current]
  const bgGradient = `linear-gradient(135deg, ${slide.gradientFrom} 0%, ${slide.gradientTo} 100%)`

  useBgShapes(heroRef, current)

  // Smooth background gradient transition
  useEffect(() => {
    if (!bgRef.current) return
    gsap.to(bgRef.current, { background: bgGradient, duration: 0.9, ease: 'power2.inOut' })
  }, [current, bgGradient])

  const goToSlide = useCallback(
    (nextIndex: number) => {
      if (transitionState !== 'idle' || nextIndex === current) return
      setTransitionState('exiting')

      const tl = gsap.timeline({
        onComplete: () => {
          setCurrent(nextIndex)
          setTransitionState('entering')
        },
      })

      if (oldProductRef.current) {
        tl.to(oldProductRef.current, {
          x: 120,
          opacity: 0,
          rotation: 10,
          duration: 0.5,
          ease: 'power2.in',
        })
      }

      if (oldContentRef.current) {
        tl.to(
          oldContentRef.current,
          { opacity: 0, y: -25, duration: 0.4, ease: 'power2.in' },
          '<',
        )
      }
    },
    [current, transitionState],
  )

  // Animate new slide in
  useEffect(() => {
    if (transitionState !== 'entering') return

    const tl = gsap.timeline({
      onComplete: () => setTransitionState('idle'),
    })

    if (newProductRef.current) {
      tl.fromTo(
        newProductRef.current,
        { x: -120, opacity: 0, rotation: -10 },
        { x: 0, opacity: 1, rotation: 0, duration: 0.8, ease: 'power4.out' },
        0,
      )
    }

    if (newContentRef.current) {
      tl.fromTo(
        newContentRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        '-=0.5',
      )
    }

    return () => { tl.kill() }
  }, [transitionState])

  // Auto‑play
  useEffect(() => {
    if (slides.length <= 1) return
    autoPlayRef.current = setInterval(() => {
      goToSlide((current + 1) % slides.length)
    }, 6000)
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current)
    }
  }, [current, goToSlide, slides.length])

  const handleSelect = useCallback(
    (index: number) => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
        autoPlayRef.current = null
      }
      goToSlide(index)
    },
    [goToSlide],
  )

  const isTransitioning = transitionState !== 'idle'

  // Loading state
  if (loading) {
    return <HeroSkeleton />
  }

  // Error state — still render with fallback data
  if (error) {
    console.warn('InteractiveHero: Supabase indisponível, usando dados estáticos')
  }

  return (
    <div ref={heroRef} className="relative w-full min-h-screen overflow-hidden">
      {/* Live background layer */}
      <div
        ref={bgRef}
        className="absolute inset-0 transition-colors"
        style={{ background: bgGradient }}
      />

      {/* Geometric accents */}
      <div
        className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.04] pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)' }}
      />
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none z-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <HeroNavbar />

      {/* Main content */}
      <div className="relative z-10 w-full min-h-screen flex flex-col lg:flex-row">
        {/* ── Product right ── */}
        <div className="relative w-full lg:w-[60%] h-[40vh] lg:h-screen order-first lg:order-last overflow-hidden">
          {isTransitioning && (
            <div ref={oldProductRef} className="absolute inset-0">
              <HeroProduct slide={slides[current]} />
            </div>
          )}
          <div ref={newProductRef} className="absolute inset-0">
            <HeroProduct slide={slide} key={`prod-${current}`} />
          </div>
        </div>

        {/* ── Content left ── */}
        <div className="relative w-full lg:w-[40%] h-[60vh] lg:h-screen order-last lg:order-first overflow-hidden">
          {isTransitioning && (
            <div ref={oldContentRef} className="absolute inset-0 flex items-center px-6 sm:px-10 lg:px-14">
              <HeroContent slide={slides[current]} containerRef={oldContentRef} />
            </div>
          )}
          <div ref={newContentRef} className="absolute inset-0 flex items-center px-6 sm:px-10 lg:px-14">
            <HeroContent slide={slide} containerRef={newContentRef} key={`content-${current}`} />
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="absolute bottom-8 left-0 right-0 z-20 flex flex-col sm:flex-row items-center justify-between px-6 sm:px-10 lg:px-14 gap-4">
        <div className="hidden sm:flex items-center gap-3 text-branco/50 text-sm font-medium tracking-wider">
          <span className="text-branco text-lg font-bold">
            {String(current + 1).padStart(2, '0')}
          </span>
          <span className="w-8 h-px bg-branco/30" />
          <span>{String(slides.length).padStart(2, '0')}</span>
        </div>

        <HeroThumbnails slides={slides} current={current} onSelect={handleSelect} />

        <div className="hidden sm:flex flex-col items-center gap-2">
          <span className="text-branco/40 text-xs tracking-widest uppercase">Role</span>
          <div className="w-px h-8 bg-gradient-to-b from-branco/40 to-transparent" />
        </div>
      </div>
    </div>
  )
}
