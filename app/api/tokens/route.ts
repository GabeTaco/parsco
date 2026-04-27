import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { tokens, jobs } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  try {
    const { jobId, expiresAt } = await req.json()

    if (!jobId || !expiresAt) {
      return NextResponse.json({ error: 'Missing jobId or expiresAt' }, { status: 400 })
    }

    // Generate url-safe token
    const tokenValue = uuidv4().replace(/-/g, '') + uuidv4().replace(/-/g, '').slice(0, 8)

    const [token] = await db
      .insert(tokens)
      .values({
        jobId,
        tokenValue,
        purpose: 'site_report',
        expiresAt: new Date(expiresAt),
      })
      .returning()

    return NextResponse.json({ ok: true, token })
  } catch (err) {
    console.error('Token creation error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const rows = await db
      .select({
        id: tokens.id,
        tokenValue: tokens.tokenValue,
        purpose: tokens.purpose,
        expiresAt: tokens.expiresAt,
        createdAt: tokens.createdAt,
        jobId: tokens.jobId,
        jobName: jobs.name,
      })
      .from(tokens)
      .leftJoin(jobs, eq(tokens.jobId, jobs.id))
      .orderBy(tokens.createdAt)

    return NextResponse.json(rows)
  } catch (err) {
    console.error('Token fetch error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
