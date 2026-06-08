import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Get the Supabase auth storage key prefix used for cookie names.
 * Matches the logic from @supabase/supabase-js/src/SupabaseClient.ts:
 *   `sb-${baseUrl.hostname.split('.')[0]}-auth-token`
 */
function getAuthCookiePrefix(): string | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) return null
  try {
    const hostname = new URL(supabaseUrl).hostname
    const projectRef = hostname.split('.')[0]
    return `sb-${projectRef}-auth-token`
  } catch {
    return null
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /admin/* routes — public admin paths
  if (!pathname.startsWith('/admin') || pathname === '/admin/login') {
    return NextResponse.next()
  }

  const authCookiePrefix = getAuthCookiePrefix()

  // Check for Supabase auth cookie (dynamic project-specific prefix)
  const cookies = request.cookies.getAll()
  const hasAuthCookie = authCookiePrefix
    ? cookies.some((c) => c.name.startsWith(authCookiePrefix))
    : false

  if (!hasAuthCookie) {
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const response = NextResponse.next()

  // Prevent CDN/proxy caching of admin pages (auth cookies present)
  response.headers.set(
    'Cache-Control',
    'private, no-cache, no-store, must-revalidate, max-age=0'
  )
  response.headers.set('Pragma', 'no-cache')

  return response
}

export const config = {
  matcher: '/admin/:path*',
}
