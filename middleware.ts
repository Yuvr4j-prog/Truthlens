import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// removed old redirects
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: '/:path*'
} 