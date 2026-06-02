'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Star, Footprints } from 'lucide-react'

const categorias = [
  {
    nome: 'Segurança',
    slug: 'seguranca',
    descricao: 'Botinas com biqueira de aço, composite ou PVC. Proteção certificada ABNT.',
    icon: Shield,
    cor: 'bg-safety/10 text-safety',
  },
  {
    nome: 'Tradicionais',
    slug: 'tradicionais',
    descricao: 'Couro legítimo, sola latex e acabamento artesanal. Conforto que dura.',
    icon: Star,
    cor: 'bg-country/10 text-country',
  },
  {
    nome: 'Acessórios',
    slug: 'acessorios',
    descricao: 'Palmilhas e itens complementares para seu calçado.',
    icon: Footprints,
    cor: 'bg-azul/10 text-azul',
  },
]

interface CategoryGridProps {
  disableAnimation?: boolean
}

export function CategoryGrid({ disableAnimation = false }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {categorias.map((cat, index) => {
        const Icon = cat.icon
        
        const cardContent = (
          <Link href={`/produtos?categoria=${cat.slug}`} className="block h-full">
            <Card className="group h-full p-6 hover:border-safety/30 hover:shadow-lg cursor-pointer transition-all duration-300">
              <div
                className={`w-12 h-12 rounded-lg ${cat.cor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <Icon size={24} strokeWidth={2} />
              </div>
              <h3 className="text-lg font-bold text-marinho mb-2 group-hover:text-azul transition-colors">
                {cat.nome}
              </h3>
              <p className="text-sm text-bege mb-4 leading-relaxed">
                {cat.descricao}
              </p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="group-hover:translate-x-1 transition-transform duration-300"
              >
                Ver modelos &rarr;
              </Button>
            </Card>
          </Link>
        )

        if (disableAnimation) {
          return <div key={cat.slug}>{cardContent}</div>
        }

        return (
          <motion.div
            key={cat.slug}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ 
              duration: 0.4, 
              delay: index * 0.1,
              ease: 'easeOut'
            }}
          >
            {cardContent}
          </motion.div>
        )
      })}
    </div>
  )
}
