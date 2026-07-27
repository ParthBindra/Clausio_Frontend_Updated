import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('clausio_token')?.value

  const isAuthPage    = request.nextUrl.pathname.startsWith('/auth')
  const isPublicPage  = request.nextUrl.pathname === '/'
  const isApiRoute    = request.nextUrl.pathname.startsWith('/api')

  // Skip middleware for API routes
  if (isApiRoute) return NextResponse.next()

  // Not logged in and trying to access protected page
  if (!token && !isAuthPage && !isPublicPage) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Already logged in and trying to access login page
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

// Which routes this middleware applies to
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/cases/:path*',
    '/hearings/:path*',
    '/strategy/:path*',
    '/client/:path*',
    '/financial/:path*',
    '/readiness/:path*',
    '/analysis/:path*',
    '/analytics/:path*',
    '/billing/:path*',
    '/settings/:path*',
    '/auth/:path*',
  ]
}