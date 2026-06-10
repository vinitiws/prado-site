import type { HeroSlide } from './types'

export const heroSlides: HeroSlide[] = [
  {
    id: 1,
    title: 'Botina de Segurança',
    subtitle: 'Linha Profissional',
    description:
      'Conforto e proteção que duram o dia inteiro. A Prado oferece a durabilidade que o trabalho exige com o conforto que você merece.',
    image: '/hero-produto-1.png',
    backgroundColor: '#1C2632',
    gradientFrom: '#1C2632',
    gradientTo: '#2C3B4E',
    buttonText: 'Ver Modelo',
    buttonLink: '/produtos',
  },
  {
    id: 2,
    title: 'Bota Tradicional',
    subtitle: 'Linha Country',
    description:
      'Couro legítimo e acabamento artesanal. Para quem valoriza a tradição sem abrir mão da resistência.',
    image: '/hero-produto-2.png',
    backgroundColor: '#9F5234',
    gradientFrom: '#9F5234',
    gradientTo: '#7A3F28',
    buttonText: 'Explorar',
    buttonLink: '/produtos',
  },
  {
    id: 3,
    title: 'Kit Starter Prado',
    subtitle: 'Seja Parceiro',
    description:
      'Comece com 30 pares e tenha reposição garantida direto da fábrica. Sem estoque encalhado, só lucro.',
    image: '/hero-produto-3.png',
    backgroundColor: '#1C2632',
    gradientFrom: '#2C3B4E',
    gradientTo: '#1C2632',
    buttonText: 'Quero ser Parceiro',
    buttonLink: '/parceiro',
  },
]
