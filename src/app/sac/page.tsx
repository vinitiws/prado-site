import type { Metadata } from 'next'
import { SacForm } from '@/components/sac/sac-form'

export const metadata: Metadata = {
  title: 'Central de Atendimento — SAC',
  description:
    'Registre sua solicitação, reclamação ou sugestão. Nossa equipe analisa cada caso com atenção e retorna em até 5 dias úteis.',
}

export default function SacPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-marinho to-azul overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.08) 40px, rgba(255,255,255,0.08) 80px)',
          }}
          aria-hidden="true"
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <span className="inline-block bg-country text-branco text-[10px] font-semibold tracking-[1.5px] uppercase px-3.5 py-1.5 rounded-full mb-6">
            SAC · Serviço de Atendimento ao Consumidor
          </span>
          <h1 className="text-branco text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">
            Como podemos <span className="text-safety">te ajudar?</span>
          </h1>
          <p className="text-bege text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-8">
            Registre sua solicitação, reclamação ou sugestão. Nossa equipe analisa
            cada caso com atenção e retorna em até 5 dias úteis.
          </p>
          <div className="flex justify-center gap-6 sm:gap-10 flex-wrap">
            <div className="text-center">
              <div className="text-safety text-2xl font-bold leading-none">+30 anos</div>
              <div className="text-bege text-xs mt-1">no mercado</div>
            </div>
            <div className="text-center">
              <div className="text-safety text-2xl font-bold leading-none">5 dias</div>
              <div className="text-bege text-xs mt-1">prazo de retorno</div>
            </div>
            <div className="text-center">
              <div className="text-safety text-2xl font-bold leading-none">100%</div>
              <div className="text-bege text-xs mt-1">casos registrados</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main: Form Card ── */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-10 relative z-20 pb-16 sm:pb-20">
        <div className="bg-branco rounded-xl border border-bege/20 border-t-[3px] border-t-country shadow-lg shadow-black/5 p-5 sm:p-8">
          <h2 className="text-lg sm:text-xl font-bold text-marinho mb-1">
            Formulário de Atendimento
          </h2>
          <p className="text-sm text-bege mb-6">
            Preencha os dados abaixo. Campos marcados com{' '}
            <span className="text-country font-semibold">*</span> são obrigatórios.
          </p>

          <SacForm />
        </div>

        {/* ── Info Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6">
          {[
            {
              icon: '📞',
              title: 'Telefone / WhatsApp',
              text: '(35) 3366-1234\nSeg–Sex, 08h–17h',
            },
            {
              icon: '📧',
              title: 'E-mail SAC',
              text: 'sac@pradocalcados.com.br\nRetorno em até 5 dias úteis',
            },
            {
              icon: '🏭',
              title: 'Itanhandu · MG',
              text: 'Fábrica principal\nProdução de calçados',
            },
            {
              icon: '🏭',
              title: 'Guaxupé · MG',
              text: 'Unidade de produção\nLinha Country Prado',
            },
            {
              icon: '📦',
              title: 'Mogi Guaçu · SP',
              text: 'Matriz · Logística\nDistribuição nacional',
            },
          ].map((card) => (
            <div
              key={card.title}
              className="bg-branco rounded-xl border border-bege/20 border-t-[3px] border-t-safety p-4 text-center"
            >
              <div className="text-xl sm:text-2xl mb-1.5">{card.icon}</div>
              <div className="text-xs font-semibold text-marinho mb-0.5">{card.title}</div>
              <div className="text-[11px] text-bege leading-relaxed whitespace-pre-line">
                {card.text}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
