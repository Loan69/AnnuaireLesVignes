import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Récupère la session actuelle
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Si aucune session et qu'on est sur une route protégée -> redirection vers /login
  const protectedPaths = ['/annuaire', '/profil', '/monProfile']
  if (!session && protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path))) {
    const loginUrl = new URL('/login', req.url)
    return NextResponse.redirect(loginUrl)
  }

  return res
}

export const config = {
  matcher: ['/annuaire/:path*', '/profil/:path*', '/monProfile'],
}
