import type { Metadata } from 'next'
import { AnimatedSection } from '@/components/ui/animated-section'

export const metadata: Metadata = {
  title: 'Sobre Nós',
  description:
    'Conheça a história da Prado Calçados. Desde 1994, fabricando botinas e botas com tradição e tecnologia.',
}

const timeline = [
  { year: '1994', text: 'Alencar e Marísia Prado fundam a empresa em Mogi Guaçu-SP, começando com produtos de limpeza e vassouras.' },
  { year: '1997', text: 'Compram novas máquinas e iniciam a produção de calçados. Processo manual, 15 pares/dia em 48m².' },
  { year: '1999', text: 'Mudança para sede maior. Seis funcionários e processo mais moderno.' },
  { year: '2013', text: 'Produção de solado injetado, terceirizada em Itanhandu-MG. Fábrica vira centro de distribuição.' },
  { year: '2016', text: 'Prado ingressa na sociedade da BRIGABOA, onde os calçados eram fabricados.' },
  { year: '2018', text: 'Reestruturação, maquinário renovado, produção de 1.000 pares/dia.' },
  { year: '2021', text: 'Constante evolução com foco em desenvolvimento sustentável e qualidade.' },
]

const materiais = [
  {
    nome: 'Raspa',
    descricao: 'Feito a partir da parte interna do couro bovino, indicada para proteger de agentes escoriantes, abrasivos, cortantes e térmicos.',
  },
  {
    nome: 'Látego',
    descricao: 'Couro que passa por hidratação e polimento para ficar com aspecto alisado, diferentemente do Nobuck que é lixado.',
  },
  {
    nome: 'Vaqueta',
    descricao: 'Feito da parte externa do couro, curtido e preparado. Mais resistência e menos espesso.',
  },
  {
    nome: 'Nobuck',
    descricao: 'Feito da parte externa do couro, lixado para ganhar aspecto aveludado e liso. Semelhante à camurça.',
  },
]

const solados = [
  { nome: 'Látex', descricao: 'Aderência em qualquer piso. Conserva o solado por mais tempo, aumentando a vida útil.' },
  { nome: 'Poliuretano (PU)', descricao: 'Polímero resistente. Pode ser monodensidade ou bidensidade (dupla injeção de proteção).' },
  { nome: 'PVC', descricao: 'Confortável, grande resistência e durabilidade.' },
  { nome: 'Borracha', descricao: 'Antiderrapante e impermeável.' },
]

const biqueiras = [
  { nome: 'Aço', descricao: 'Biqueira em aço carbono com pintura eletrostática anticorrosiva. 200J e 15KN. ABNT NBR 20345.' },
  { nome: 'Composite', descricao: 'Biqueira em plástico carbono 200J e 15KN. Sem componentes metálicos. Indicado para risco elétrico.' },
  { nome: 'PVC', descricao: 'Biqueira plástica com reforço frontal e formato anatômico. ABNT NBR 20347.' },
]

export default function SobrePage() {
  return (
    <div className="flex flex-col">
      <section className="bg-marinho text-branco py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Nossa História
          </h1>
          <p className="text-bege text-lg max-w-2xl mx-auto">
            Do trabalho artesanal à produção industrial. A Prado nasceu da força de quem faz.
          </p>
        </div>
      </section>

      <AnimatedSection className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="space-y-8">
          {timeline.map((item, i) => (
            <div key={item.year} className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-safety flex items-center justify-center text-marinho font-bold text-sm shrink-0">
                  {item.year.slice(2)}
                </div>
                {i < timeline.length - 1 && (
                  <div className="w-0.5 flex-1 bg-bege/30 mt-2" />
                )}
              </div>
              <div className="pb-8">
                <span className="text-xs font-bold text-safety uppercase tracking-wider">
                  {item.year}
                </span>
                <p className="text-bege mt-1 text-sm leading-relaxed">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </AnimatedSection>

      <AnimatedSection className="bg-bege/10 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-marinho text-center mb-10">
            Nossos Materiais
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {materiais.map((mat) => (
              <div
                key={mat.nome}
                className="bg-branco rounded-xl p-6 border border-bege/20"
              >
                <h3 className="text-lg font-bold text-marinho mb-2">{mat.nome}</h3>
                <p className="text-sm text-bege leading-relaxed">{mat.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-marinho text-center mb-10">
          Tipos de Solado
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {solados.map((sol) => (
            <div
              key={sol.nome}
              className="bg-branco rounded-xl p-6 border border-bege/20"
            >
              <h3 className="text-lg font-bold text-marinho mb-2">{sol.nome}</h3>
              <p className="text-sm text-bege leading-relaxed">{sol.descricao}</p>
            </div>
          ))}
        </div>
      </AnimatedSection>

      <AnimatedSection className="bg-marinho/5 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-marinho text-center mb-10">
            Biqueiras
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {biqueiras.map((bq) => (
              <div
                key={bq.nome}
                className="bg-branco rounded-xl p-6 border border-bege/20"
              >
                <h3 className="text-lg font-bold text-marinho mb-2">{bq.nome}</h3>
                <p className="text-sm text-bege leading-relaxed">{bq.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>
    </div>
  )
}
