import type { Metadata } from 'next'
import { AnimatedSection } from '@/components/ui/animated-section'
import { PartnerForm } from '@/components/parceiro/partner-form'

export const metadata: Metadata = {
  title: 'Seja Parceiro',
  description:
    'Venda mais e estoque menos. Seja parceiro da Prado e tenha reposição rápida direto da fábrica.',
}

export default function ParceiroPage() {
  return (
    <div className="flex flex-col">
      <section className="bg-marinho text-branco py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Venda mais e estoque menos.
            </h1>
            <p className="text-bege text-lg mb-4">
              Seja parceiro da Prado. Desde 1994, fabricando botinas de segurança
              com durabilidade comprovada e reposição rápida para o seu negócio.
            </p>
            <div className="flex items-center gap-4 text-safety">
              <span className="text-4xl font-bold">30</span>
              <span className="text-sm">
                anos fabricando calçados que giram e duram
              </span>
            </div>
          </div>
        </div>
      </section>

      <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-marinho mb-6">
              Como funciona?
            </h2>
            <ul className="space-y-4">
              {[
                {
                  title: 'Kit Starter',
                  desc: 'Comece com 30 pares selecionados e tenha reposição garantida direto da fábrica.',
                },
                {
                  title: 'Parceria direta',
                  desc: 'Sem intermediários. Compra direta com a Prado, melhor margem para você.',
                },
                {
                  title: 'Reposição inteligente',
                  desc: 'A Prado repõe o que gira. Seu estoque sempre renovado sem esforço.',
                },
                {
                  title: 'Presença em todo Brasil',
                  desc: 'Distribuição nacional com agilidade e qualidade confirmada.',
                },
              ].map((item) => (
                <li key={item.title} className="flex gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-safety mt-2 shrink-0" />
                  <div>
                    <h3 className="font-bold text-marinho">{item.title}</h3>
                    <p className="text-sm text-bege">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 bg-safety/10 rounded-xl p-6 border border-safety/20">
              <p className="text-sm text-marinho font-medium">
                &ldquo;Cada par encalhado é dinheiro dormindo na prateleira. A
                maioria dos lojistas perde até <strong>30% da margem</strong> por
                falta de giro e reposição inteligente.&rdquo;
              </p>
            </div>
          </div>

          <div className="bg-branco rounded-2xl border border-bege/20 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-marinho mb-2">
              Quero ser parceiro
            </h2>
            <p className="text-sm text-bege mb-6">
              Preencha o formulário e nossa equipe entrará em contato.
            </p>
            <PartnerForm />
          </div>
        </div>
      </AnimatedSection>
    </div>
  )
}
