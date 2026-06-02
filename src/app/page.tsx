import { HeroCarousel } from '@/components/home/hero-carousel'
import { ProductCards } from '@/components/home/product-cards'
import { CategoryGrid } from '@/components/home/category-grid'
import { BannerSection } from '@/components/home/banner-section'
import { PromotionalBanner } from '@/components/home/promotional-banner'
import { AnimatedSection } from '@/components/ui/animated-section'

async function getDestaques() {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    if (!supabase) return []
    const { data } = await supabase
      .from('produtos')
      .select('*, imagens:produto_imagens(*)')
      .eq('destaque', true)
      .eq('ativo', true)
      .order('created_at', { ascending: false })
      .limit(8)

    return data || []
  } catch {
    return []
  }
}

export default async function Home() {
  const destaques = await getDestaques()

  return (
    <div className="flex flex-col">
      <HeroCarousel />

      <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-marinho mb-3">
            Produtos em Destaque
          </h2>
          <p className="text-bege text-sm sm:text-base max-w-lg mx-auto">
            Os modelos mais vendidos da Prado, selecionados para você.
          </p>
        </div>
        <ProductCards produtos={destaques} />
      </AnimatedSection>

      <PromotionalBanner 
        tipo="banner" 
        desktopHeight="h-[400px]"
        mobileHeight="h-[250px]"
      />

      <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-marinho mb-3">
            Nossas Categorias
          </h2>
          <p className="text-bege text-sm sm:text-base max-w-lg mx-auto">
            Do campo à indústria, a Prado tem o calçado ideal para você.
          </p>
        </div>
        <CategoryGrid />
      </AnimatedSection>

      <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        <BannerSection
          variant="safety"
          title="Seu estoque tá parado?"
          subtitle="Cada par encalhado é dinheiro dormindo na prateleira. Comece com 30 pares no Kit Starter e tenha reposição garantida direto da fábrica."
          cta="Quero ser parceiro Prado"
          href="/parceiro"
          disableAnimation={true}
        />
      </AnimatedSection>

      <PromotionalBanner 
        tipo="banner-pos-cta" 
        desktopHeight="h-[400px]"
        mobileHeight="h-[250px]"
      />

      <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-marinho mb-4">
              Quem é a Prado pra você?
            </h2>
            <p className="text-bege leading-relaxed mb-4">
              A Prado representa o equilíbrio entre tradição e tecnologia. Entre
              a mão que fabrica e o maquinário que aperfeiçoa. Entre o ontem que
              construiu base e o amanhã que se projeta em inovação.
            </p>
            <p className="text-bege leading-relaxed">
              A Prado não apenas protege &mdash; ela sustenta. Ela não apenas
              dura &mdash; ela acompanha. Ela não apenas calça &mdash; ela
              representa quem pisa firme.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { palavra: 'Confiável', cor: 'bg-safety/10 text-safety' },
              { palavra: 'Técnica', cor: 'bg-azul/10 text-azul' },
              { palavra: 'Moderna', cor: 'bg-country/10 text-country' },
              { palavra: 'Brasileira', cor: 'bg-marinho text-branco' },
            ].map((item) => (
              <div
                key={item.palavra}
                className={`${item.cor} rounded-xl p-6 text-center font-bold text-lg`}
              >
                {item.palavra}
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>
    </div>
  )
}
