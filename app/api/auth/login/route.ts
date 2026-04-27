import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { sessionOptions, SessionData } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { pin } = await req.json()
  const res = NextResponse.json({ ok: true })

  if (pin !== process.env.REPO_PIN) {
    return NextResponse.json({ error: 'Incorrect PIN' }, { status: 401 })
  }

  const session = await getIronSession<SessionData>(req, res, sessionOptions)
  session.authenticated = true
  await session.save()
  return res
}
