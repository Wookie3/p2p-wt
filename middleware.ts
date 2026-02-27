import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple rate limiting using memory (for production, use Redis/Upstash)
const rateLimit = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS = 100

export async function middleware(request: NextRequest) {
  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
    const now = Date.now()

    const record = rateLimit.get(ip)

    if (!record || now > record.resetTime) {
      rateLimit.set(ip, {
        count: 1,
        resetTime: now + RATE_LIMIT_WINDOW
      })
    } else {
      record.count++

      if (record.count > MAX_REQUESTS) {
        return new NextResponse(
          JSON.stringify({ error: 'Too many requests. Please try again later.' }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': MAX_REQUESTS.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': record.resetTime.toString()
            }
          }
        )
      }
    }

    // Clean up old entries
    for (const [key, value] of rateLimit.entries()) {
      if (now > value.resetTime) {
        rateLimit.delete(key)
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
