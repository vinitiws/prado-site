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
}

export function BannerSection({
  image,
  title,
  subtitle,
  cta,
  href,
  variant = 'default',
}: BannerSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`relative overflow-hidden rounded-2xl ${
        variant === 'safety' ? 'bg-safety' : 'bg-marinho'
      }`}
    >
      {image && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${image})` }}
        />
      )}
      <div className="relative z-10 px-6 py-12 sm:px-12 sm:py-16 text-center">
        <h2
          className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 ${
            variant === 'safety' ? 'text-marinho' : 'text-branco'
          }`}
        >
          {title}
        </h2>
        <p
          className={`text-base sm:text-lg mb-6 max-w-lg mx-auto ${
            variant === 'safety' ? 'text-marinho/80' : 'text-bege'
          }`}
        >
          {subtitle}
        </p>
        <Link href={href}>
          <Button
            variant={variant === 'safety' ? 'secondary' : 'primary'}
            size="lg"
          >
            {cta}
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}
