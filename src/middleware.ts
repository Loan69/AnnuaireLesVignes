import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createMiddlewareClient({ req, res })

  // Hydrate la session dans les cookies
  await supabase.auth.getSession()

  return res
}

export const config = {
  matcher: [
    '/annuaire/:path*',
    '/profil/:path*',
    '/monProfile',
    '/login/:path*',
    // ajoute ici toutes les routes protégées
  ],
}
