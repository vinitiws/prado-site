'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import styles from './slider.module.css'

export interface SliderLayer {
  /** SVG inline (paths, formas, gradientes). O consumidor decide o conteúdo. */
  svg: ReactNode
  /** 0 = estático, 1 = parallax máximo */
  depth: number
  /** Posicionamento absoluto dentro do slide. Default: inset-0 */
  className?: string
}

export interface SliderImage {
  src: string
  alt: string
  width: number
  height: number
}

export interface SliderSlide {
  id: string
  image?: SliderImage
  imageMobile?: SliderImage
  title?: string
  subtitle?: string
  cta?: { label: string; href: string }
  layers?: SliderLayer[]
  /** Cor de fundo do slide (Tailwind class). Default: bg-branco */
  bgClassName?: string
}

export interface SliderProps {
  slides: SliderSlide[]
  /** ms para auto-advance. 0 = desativado. Default 6000. */
  autoAdvance?: number
  className?: string
  /** Classes Tailwind para altura. Default: h-[100vh] min-h-[400px] max-h-[700px] */
  height?: string
  loop?: boolean
  showDots?: boolean
  showArrows?: boolean
  /** Multiplicador global do parallax. Default 0.15 */
  parallaxStrength?: number
}

/**
 * Hook SSR-safe: detecta se o usuário prefere motion reduzido.
 * Usa useSyncExternalStore para evitar setState síncrono em effect.
 */
function usePrefersReducedMotion(): boolean {
  const subscribe = useCallback((cb: () => void) => {
    if (typeof window === 'undefined') return () => {}
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    mq.addEventListener('change', cb)
    return () => mq.removeEventListener('change', cb)
  }, [])
  const getSnapshot = useCallback(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])
  const getServerSnapshot = useCallback(() => false, [])
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

type LayerRefMap = Array<Array<HTMLDivElement | null>>

export const Slider = forwardRef<HTMLDivElement, SliderProps>(function Slider(
  {
    slides,
    autoAdvance = 6000,
    className,
    height = 'h-[100vh] min-h-[400px] max-h-[700px]',
    loop = true,
    showDots = true,
    showArrows = true,
    parallaxStrength = 0.15,
  },
  ref
) {
  const reducedMotion = usePrefersReducedMotion()
  const [current, setCurrent] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const rootRef = useRef<HTMLDivElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  // Refs para layers; mapa 2D. Inicializado em useLayoutEffect (abaixo).
  const layerRefs = useRef<LayerRefMap>([])
  const dragStateRef = useRef<{
    active: boolean
    pointerId: number | null
    startX: number
    startTime: number
    lastX: number
    width: number
  }>({
    active: false,
    pointerId: null,
    startX: 0,
    startTime: 0,
    lastX: 0,
    width: 0,
  })
  // currentRef para callbacks estáveis que precisam do current sem causar re-bind
  const currentRef = useRef(current)
  useEffect(() => {
    currentRef.current = current
  }, [current])

  // Combina refs externa e interna
  const setRootRef = useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
    },
    [ref]
  )

  const count = slides.length

  // (Re)inicializa layerRefs quando slides mudam (em effect, não em render)
  useEffect(() => {
    layerRefs.current = slides.map((s) => Array(s.layers?.length ?? 0).fill(null))
  }, [slides])

  const goTo = useCallback(
    (idx: number) => {
      if (count === 0) return
      const wrapped = ((idx % count) + count) % count
      setCurrent(wrapped)
    },
    [count]
  )

  const next = useCallback(() => {
    if (count === 0) return
    if (currentRef.current === count - 1 && !loop) return
    setCurrent((c) => (c + 1) % count)
  }, [count, loop])

  const prev = useCallback(() => {
    if (count === 0) return
    if (currentRef.current === 0 && !loop) return
    setCurrent((c) => (c - 1 + count) % count)
  }, [count, loop])

  // Helper: aplica parallax em todas as layers com base em um xPercent (-1..1)
  const applyParallax = useCallback(
    (xPercent: number, duration: number) => {
      if (reducedMotion) return
      const refs = layerRefs.current
      refs.forEach((layers, slideIdx) => {
        layers.forEach((el, layerIdx) => {
          if (!el) return
          const depth = slides[slideIdx]?.layers?.[layerIdx]?.depth ?? 0
          const target = -xPercent * depth * parallaxStrength * 200
          gsap.to(el, { xPercent: target, duration, ease: 'power2.out', overwrite: 'auto' })
        })
      })
    },
    [slides, parallaxStrength, reducedMotion]
  )

  /* ------------ Animações GSAP + listeners de pointer ------------ */

  useGSAP(
    () => {
      const track = trackRef.current
      const root = rootRef.current
      if (!track || !root || count === 0) return

      // Sincroniza posição inicial do track com o current
      gsap.set(track, { xPercent: -currentRef.current * 100 })

      const onPointerDown = (e: PointerEvent) => {
        if (reducedMotion) return
        const target = e.target as HTMLElement
        if (target.closest('button, a')) return
        dragStateRef.current.active = true
        dragStateRef.current.pointerId = e.pointerId
        dragStateRef.current.startX = e.clientX
        dragStateRef.current.startTime = performance.now()
        dragStateRef.current.lastX = e.clientX
        dragStateRef.current.width = root.offsetWidth
        root.setPointerCapture(e.pointerId)
        gsap.killTweensOf(track)
      }

      const onPointerMove = (e: PointerEvent) => {
        if (!dragStateRef.current.active) return
        const dx = e.clientX - dragStateRef.current.startX
        dragStateRef.current.lastX = e.clientX
        const width = dragStateRef.current.width
        const baseX = -currentRef.current * width
        let nextX = baseX + dx
        if (!loop) {
          const minX = -(count - 1) * width
          const maxX = 0
          if (nextX > maxX) nextX = maxX + (nextX - maxX) * 0.35
          if (nextX < minX) nextX = minX + (nextX - minX) * 0.35
        }
        gsap.set(track, { x: nextX })
        const xPercent = width === 0 ? 0 : dx / width
        applyParallax(xPercent, 0.6)
      }

      const onPointerUp = (e: PointerEvent) => {
        if (!dragStateRef.current.active) return
        const dx = e.clientX - dragStateRef.current.startX
        const dt = performance.now() - dragStateRef.current.startTime
        const velocity = dt > 0 ? Math.abs(dx) / dt : 0
        const fastSwipe = velocity > 0.3
        const farSwipe = Math.abs(dx) > 50
        const moveBy = fastSwipe || farSwipe ? (dx < 0 ? 1 : -1) : 0
        try {
          root.releasePointerCapture(e.pointerId)
        } catch {
          /* noop */
        }
        dragStateRef.current.active = false
        if (moveBy > 0) {
          if (currentRef.current === count - 1 && !loop) goTo(currentRef.current)
          else next()
        } else if (moveBy < 0) {
          if (currentRef.current === 0 && !loop) goTo(currentRef.current)
          else prev()
        } else {
          goTo(currentRef.current)
        }
        applyParallax(0, 0.6)
      }

      const onPointerCancel = (e: PointerEvent) => onPointerUp(e)

      const onMouseMove = (e: MouseEvent) => {
        if (dragStateRef.current.active) return
        if (reducedMotion) return
        const rect = root.getBoundingClientRect()
        const xPercent = (e.clientX - rect.left) / rect.width - 0.5
        applyParallax(xPercent, 0.3)
      }
      const onMouseLeave = () => {
        if (dragStateRef.current.active) return
        applyParallax(0, 0.4)
      }

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowRight') next()
        else if (e.key === 'ArrowLeft') prev()
        else if (e.key === 'Home') goTo(0)
        else if (e.key === 'End') goTo(count - 1)
      }

      root.addEventListener('pointerdown', onPointerDown)
      root.addEventListener('pointermove', onPointerMove)
      root.addEventListener('pointerup', onPointerUp)
      root.addEventListener('pointercancel', onPointerCancel)
      root.addEventListener('mousemove', onMouseMove)
      root.addEventListener('mouseleave', onMouseLeave)
      root.addEventListener('keydown', onKeyDown)

      return () => {
        root.removeEventListener('pointerdown', onPointerDown)
        root.removeEventListener('pointermove', onPointerMove)
        root.removeEventListener('pointerup', onPointerUp)
        root.removeEventListener('pointercancel', onPointerCancel)
        root.removeEventListener('mousemove', onMouseMove)
        root.removeEventListener('mouseleave', onMouseLeave)
        root.removeEventListener('keydown', onKeyDown)
      }
    },
    { dependencies: [count, loop, next, prev, goTo, reducedMotion, applyParallax], scope: rootRef }
  )

  // Quando current muda, anima o track e o parallax de slide
  useEffect(() => {
    if (count === 0) return
    const track = trackRef.current
    if (track) {
      gsap.to(track, {
        xPercent: -current * 100,
        duration: reducedMotion ? 0.01 : 0.7,
        ease: 'power3.out',
      })
    }
    if (reducedMotion) return
    layerRefs.current.forEach((layers, slideIdx) => {
      layers.forEach((el, layerIdx) => {
        if (!el) return
        const depth = slides[slideIdx]?.layers?.[layerIdx]?.depth ?? 0
        const targetX = slideIdx === current ? 0 : (slideIdx < current ? -1 : 1) * depth * parallaxStrength * 100
        gsap.to(el, { xPercent: targetX, duration: 0.8, ease: 'power3.out', overwrite: 'auto' })
      })
    })
  }, [current, count, slides, parallaxStrength, reducedMotion])

  /* ------------ Auto-advance ------------ */
  useEffect(() => {
    if (count <= 1) return
    if (autoAdvance <= 0) return
    if (reducedMotion) return
    if (isHovered || isFocused) return
    if (typeof document !== 'undefined' && document.hidden) return

    const timer = setInterval(() => {
      if (currentRef.current === count - 1 && !loop) return
      setCurrent((c) => (c + 1) % count)
    }, autoAdvance)
    return () => clearInterval(timer)
  }, [count, autoAdvance, loop, isHovered, isFocused, reducedMotion])

  /* ------------ Teclado global ------------ */
  useEffect(() => {
    if (count === 0) return
    const onKey = (e: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement | null
      const tag = (active?.tagName || '').toLowerCase()
      if (tag === 'input' || tag === 'textarea' || active?.isContentEditable) return
      if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [count, next, prev])

  if (count === 0) return null

  return (
    <div
      ref={setRootRef}
      className={cn(
        'relative w-full overflow-hidden focus:outline-none',
        height,
        className
      )}
      role="region"
      aria-roledescription="carousel"
      aria-label="Slider de conteúdo"
      tabIndex={0}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      <div
        ref={trackRef}
        className={cn('flex h-full', styles.track)}
        style={{ width: `${count * 100}%` }}
      >
        {slides.map((slide, slideIdx) => (
          <div
            key={slide.id}
            className={cn(styles.slide, 'relative h-full overflow-hidden', slide.bgClassName ?? 'bg-branco')}
            style={{ width: `${100 / count}%` }}
            role="group"
            aria-roledescription="slide"
            aria-label={`${slideIdx + 1} de ${count}`}
            aria-hidden={slideIdx !== current}
          >
            {slide.layers?.map((layer, layerIdx) => (
              <div
                key={layerIdx}
                ref={(el) => {
                  if (!layerRefs.current[slideIdx]) layerRefs.current[slideIdx] = []
                  layerRefs.current[slideIdx][layerIdx] = el
                }}
                className={cn('absolute inset-0', styles.layer, layer.className)}
                aria-hidden="true"
              >
                {layer.svg}
              </div>
            ))}

            {slide.image && (
              <div className="hidden md:block absolute inset-0">
                <Image
                  src={slide.image.src}
                  alt={slide.image.alt}
                  fill
                  sizes="100vw"
                  priority={slideIdx === 0}
                  className="object-cover"
                />
              </div>
            )}
            {!slide.imageMobile && slide.image && (
              <div className="block md:hidden absolute inset-0">
                <Image
                  src={slide.image.src}
                  alt={slide.image.alt}
                  fill
                  sizes="100vw"
                  className="object-cover object-center"
                />
              </div>
            )}
            {slide.imageMobile && (
              <div className="block md:hidden absolute inset-0">
                <Image
                  src={slide.imageMobile.src}
                  alt={slide.imageMobile.alt}
                  fill
                  sizes="100vw"
                  className="object-cover object-center"
                />
              </div>
            )}

            {(slide.title || slide.subtitle || slide.cta) && (
              <div className="relative z-10 flex h-full items-center px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl">
                  {slide.title && (
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-marinho mb-4">
                      {slide.title}
                    </h2>
                  )}
                  {slide.subtitle && (
                    <p className="text-lg sm:text-xl text-azul/80 mb-8 max-w-lg">
                      {slide.subtitle}
                    </p>
                  )}
                  {slide.cta && (
                    <Button asChild variant="primary" size="lg">
                      <Link href={slide.cta.href}>{slide.cta.label}</Link>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showArrows && count > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-branco/10 hover:bg-branco/20 text-branco transition-colors backdrop-blur-sm"
            aria-label="Slide anterior"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={next}
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-branco/10 hover:bg-branco/20 text-branco transition-colors backdrop-blur-sm"
            aria-label="Próximo slide"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {showDots && count > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              className={cn(
                'h-2.5 rounded-full transition-all',
                i === current ? 'bg-safety w-8' : 'bg-branco/40 w-2.5'
              )}
              aria-label={`Ir para slide ${i + 1}`}
              aria-current={i === current ? 'true' : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
})

Slider.displayName = 'Slider'

/* ---- Subcomponentes auxiliares para composição de layers SVG ---- */

export const SliderBlob = ({
  className,
  fill = 'var(--color-safety)',
  opacity = 0.25,
}: {
  className?: string
  fill?: string
  opacity?: number
}) => (
  <svg
    className={className}
    viewBox="0 0 600 600"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    <path
      fill={fill}
      opacity={opacity}
      d="M421 90Q540 162 552 296T463 526q-103 84-244 56T58 432Q22 312 90 196T283 49q72-30 138 41Z"
    />
  </svg>
)

export const SliderRings = ({
  className,
  stroke = 'var(--color-country)',
  opacity = 0.35,
}: {
  className?: string
  stroke?: string
  opacity?: number
}) => (
  <svg
    className={className}
    viewBox="0 0 200 200"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
  >
    <circle cx="100" cy="100" r="30" fill="none" stroke={stroke} strokeWidth="1.5" opacity={opacity} />
    <circle cx="100" cy="100" r="55" fill="none" stroke={stroke} strokeWidth="1.5" opacity={opacity * 0.7} />
    <circle cx="100" cy="100" r="80" fill="none" stroke={stroke} strokeWidth="1.5" opacity={opacity * 0.4} />
  </svg>
)

export const SliderGrid = ({
  className,
  stroke = 'var(--color-azul)',
  opacity = 0.06,
}: {
  className?: string
  stroke?: string
  opacity?: number
}) => (
  <svg
    className={className}
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <defs>
      <pattern id="slider-grid" width="10" height="10" patternUnits="userSpaceOnUse">
        <path d="M 10 0 L 0 0 0 10" fill="none" stroke={stroke} strokeWidth="0.5" opacity={opacity} />
      </pattern>
    </defs>
    <rect width="100" height="100" fill="url(#slider-grid)" />
  </svg>
)
