import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Only check auth for protected routes
  if (request.nextUrl.pathname.startsWith('/contacts') ||
      request.nextUrl.pathname.startsWith('/call') ||
      request.nextUrl.pathname.startsWith('/requests') ||
      request.nextUrl.pathname.startsWith('/settings')) {

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            response.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.getSession()

    // Allow access if authenticated or has anonymous session
    if (!session && !request.cookies.get('p2p-wt-storage')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}

export const config = {
  matcher: ['/contacts/:path*', '/call/:path*', '/requests/:path*', '/settings/:path*'],
}
