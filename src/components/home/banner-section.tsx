'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface BannerSectionProps {
  image?: string
  title: string
  subtitle: string
  cta: string
  href: string
  variant?: 'default' | 'safety'
  disableAnimation?: boolean
}

export function BannerSection({
  image,
  title,
  subtitle,
  cta,
  href,
  variant = 'default',
  disableAnimation = false,
}: BannerSectionProps) {
  const containerClasses = `relative overflow-hidden rounded-2xl ${
    variant === 'safety' ? 'bg-safety' : 'bg-marinho'
  }`

  const titleClasses = `text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 ${
    variant === 'safety' ? 'text-marinho' : 'text-branco'
  }`

  const subtitleClasses = `text-base sm:text-lg mb-6 max-w-2xl mx-auto leading-relaxed ${
    variant === 'safety' ? 'text-marinho/80' : 'text-bege'
  }`

  const content = (
    <>
      {image && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${image})` }}
          aria-hidden="true"
        />
      )}
      <div className="relative z-10 px-6 py-12 sm:px-12 sm:py-16 lg:py-20 text-center">
        <h2 className={titleClasses}>{title}</h2>
        <p className={subtitleClasses}>{subtitle}</p>
        <Link href={href}>
          <Button
            variant={variant === 'safety' ? 'secondary' : 'primary'}
            size="lg"
            className="shadow-lg hover:shadow-xl transition-shadow"
          >
            {cta}
          </Button>
        </Link>
      </div>
    </>
  )

  if (disableAnimation) {
    return <div className={containerClasses}>{content}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={containerClasses}
    >
      {content}
    </motion.div>
  )
}
