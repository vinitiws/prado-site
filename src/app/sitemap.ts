import type { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'

const BASE_URL = 'https://www.pradocalcados.com.br'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/produtos`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/sobre`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/parceiro`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  // Fetch active products from Supabase for dynamic product routes
  const supabase = createAdminClient()
  if (!supabase) return staticRoutes

  const { data: produtos } = await supabase
    .from('produtos')
    .select('slug, updated_at')
    .eq('ativo', true)

  if (!produtos) return staticRoutes

  const productRoutes: MetadataRoute.Sitemap = produtos.map((produto) => ({
    url: `${BASE_URL}/produtos/${produto.slug}`,
    lastModified: produto.updated_at ? new Date(produto.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticRoutes, ...productRoutes]
}
