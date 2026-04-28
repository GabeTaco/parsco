import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { estimates, estimateItems } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get('jobId')
  if (!jobId) return NextResponse.json({ error: 'Missing jobId' }, { status: 400 })

  const rows = await db.select().from(estimates).where(eq(estimates.jobId, jobId)).limit(1)
  if (rows.length === 0) return NextResponse.json({ estimate: null, items: [] })

  const estimate = rows[0]
  const items = await db
    .select()
    .from(estimateItems)
    .where(eq(estimateItems.estimateId, estimate.id))
    .orderBy(asc(estimateItems.csiDivision), asc(estimateItems.sortOrder))

  return NextResponse.json({ estimate, items })
}

export async function POST(req: NextRequest) {
  const { jobId, name } = await req.json()
  if (!jobId) return NextResponse.json({ error: 'Missing jobId' }, { status: 400 })

  const [estimate] = await db.insert(estimates).values({
    jobId,
    name: name ?? 'Initial Estimate',
  }).returning()

  return NextResponse.json({ estimate })
}
