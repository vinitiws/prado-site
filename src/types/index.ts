export interface Categoria {
  id: string
  nome: string
  slug: string
  descricao: string | null
  ordem: number
  created_at: string
}

export interface Subcategoria {
  id: string
  categoria_id: string
  nome: string
  slug: string
  descricao: string | null
  ordem: number
  created_at: string
}

export interface Produto {
  id: string
  subcategoria_id: string
  nome: string
  slug: string
  ref: string
  descricao_curta: string | null
  descricao_completa: string | null
  especificacoes: ProdutoEspecificacoes | null
  destaque: boolean
  ativo: boolean
  created_at: string
  updated_at: string
  imagens?: ProdutoImagem[]
  subcategoria?: Subcategoria
}

export interface ProdutoEspecificacoes {
  couro?: string
  solado?: string
  biqueira?: string
  norma?: string
}

export interface ProdutoImagem {
  id: string
  produto_id: string
  url: string
  alt: string | null
  ordem: number
  tipo: 'galeria' | 'thumbnail'
  created_at: string
}

export interface SiteImagem {
  id: string
  tipo: 'carousel' | 'card' | 'banner'
  url: string
  link: string | null
  titulo: string | null
  subtitulo: string | null
  cta_texto: string | null
  ordem: number
  ativo: boolean
  created_at: string
}
