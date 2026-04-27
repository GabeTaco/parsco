import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { sessionOptions, SessionData } from './lib/auth'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const { pathname } = req.nextUrl

  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/form') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return res
  }

  const session = await getIronSession<SessionData>(req, res, sessionOptions)
  if (!session.authenticated) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
