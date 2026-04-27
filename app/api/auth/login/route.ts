import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { pin } = await req.json()

  if (pin !== process.env.REPO_PIN) {
    return NextResponse.json({ error: 'Incorrect PIN' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('parsco_session', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
  return res
}
