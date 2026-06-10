export interface HeroSlide {
  id: number
  title: string
  subtitle: string
  description: string
  image: string
  backgroundColor: string
  gradientFrom: string
  gradientTo: string
  buttonText: string
  buttonLink: string
  /** Supabase storage path (optional, for admin use) */
  storagePath?: string | null
  /** Mobile-specific image URL (optional) */
  urlMobile?: string | null
}
