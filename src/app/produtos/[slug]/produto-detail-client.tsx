'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Produto } from '@/types'

interface Props {
  produto: Produto
}

export function ProdutoDetailClient({ produto }: Props) {
  const specs = produto.especificacoes || {}

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Link
        href="/produtos"
        className="inline-flex items-center gap-1 text-sm text-bege hover:text-azul transition-colors mb-6"
      >
        <ChevronLeft size={16} />
        Voltar para Produtos
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-1 gap-4">
            {produto.imagens && produto.imagens.length > 0 ? (
              produto.imagens
                .sort((a, b) => a.ordem - b.ordem)
                .map((img, i) => (
                  <div
                    key={img.id}
                    className="relative aspect-square rounded-xl overflow-hidden bg-bege/10"
                  >
                    <Image
                      src={img.url}
                      alt={img.alt || produto.nome}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority={i === 0}
                    />
                  </div>
                ))
            ) : (
              <div className="aspect-square rounded-xl bg-bege/10 flex items-center justify-center text-bege">
                Sem imagem disponível
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          <div>
            <span className="inline-block text-xs font-semibold text-safety bg-safety/10 px-3 py-1 rounded-full mb-3">
              REF. {produto.ref}
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-marinho">
              {produto.nome}
            </h1>
          </div>

          {produto.descricao_completa && (
            <p className="text-bege leading-relaxed">
              {produto.descricao_completa}
            </p>
          )}

          {Object.keys(specs).length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-marinho mb-3">
                Especificações Técnicas
              </h2>
              <Card className="divide-y divide-bege/20">
                {specs.couro && (
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-sm text-bege">Couro</span>
                    <span className="text-sm font-medium text-marinho">
                      {specs.couro}
                    </span>
                  </div>
                )}
                {specs.solado && (
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-sm text-bege">Solado</span>
                    <span className="text-sm font-medium text-marinho">
                      {specs.solado}
                    </span>
                  </div>
                )}
                {specs.biqueira && (
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-sm text-bege">Biqueira</span>
                    <span className="text-sm font-medium text-marinho">
                      {specs.biqueira}
                    </span>
                  </div>
                )}
                {specs.norma && (
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-sm text-bege">Norma</span>
                    <span className="text-sm font-medium text-marinho">
                      {specs.norma}
                    </span>
                  </div>
                )}
              </Card>
            </div>
          )}

          {produto.subcategoria && (
            <div>
              <h2 className="text-sm font-semibold text-bege uppercase tracking-wider mb-1">
                Categoria
              </h2>
              <Link
                href={`/produtos?subcategoria=${produto.subcategoria.slug}`}
                className="text-azul hover:text-safety transition-colors font-medium"
              >
                {produto.subcategoria.nome}
              </Link>
            </div>
          )}

          <Link href="/parceiro">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              Seja um parceiro Prado
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
