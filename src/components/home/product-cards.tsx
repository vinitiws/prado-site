'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import type { Produto } from '@/types'

interface ProductCardsProps {
  produtos: Produto[]
}

export function ProductCards({ produtos }: ProductCardsProps) {
  if (produtos.length === 0) {
    return (
      <p className="text-center text-bege text-sm">
        Em breve novos produtos serão cadastrados.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {produtos.map((produto, index) => (
        <motion.div
          key={produto.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
        >
          <Link href={`/produtos/${produto.slug}`} className="group block">
            <Card className="h-full">
              <div className="aspect-square relative overflow-hidden bg-bege/10">
                {produto.imagens?.[0] ? (
                  <Image
                    src={produto.imagens[0].url}
                    alt={produto.imagens[0].alt || produto.nome}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-bege text-sm">
                    Sem imagem
                  </div>
                )}
              </div>
              <div className="p-3 sm:p-4">
                <span className="text-xs font-medium text-safety bg-safety/10 px-2 py-0.5 rounded-full">
                  {produto.ref}
                </span>
                <h3 className="mt-2 text-sm font-semibold text-marinho line-clamp-2 leading-snug">
                  {produto.nome}
                </h3>
                {produto.descricao_curta && (
                  <p className="mt-1 text-xs text-bege line-clamp-2">
                    {produto.descricao_curta}
                  </p>
                )}
              </div>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
