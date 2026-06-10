'use client'

import type { HeroSlide } from './types'

interface HeroThumbnailsProps {
  slides: HeroSlide[]
  current: number
  onSelect: (index: number) => void
}

export function HeroThumbnails({ slides, current, onSelect }: HeroThumbnailsProps) {
  return (
    <div className="flex items-center gap-4">
      {/* Previous */}
      <button
        onClick={() => onSelect((current - 1 + slides.length) % slides.length)}
        className="group flex items-center justify-center w-10 h-10 rounded-full border border-branco/20 hover:border-branco/50 text-branco/60 hover:text-branco transition-all duration-300"
        aria-label="Slide anterior"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Indicators */}
      <div className="flex items-center gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={`relative h-1.5 rounded-full transition-all duration-500 ${
              i === current
                ? 'w-10 bg-safety'
                : 'w-3 bg-branco/30 hover:bg-branco/50'
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Next */}
      <button
        onClick={() => onSelect((current + 1) % slides.length)}
        className="group flex items-center justify-center w-10 h-10 rounded-full border border-branco/20 hover:border-branco/50 text-branco/60 hover:text-branco transition-all duration-300"
        aria-label="Próximo slide"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}
