import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rfis } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get('jobId')
  if (!jobId) return NextResponse.json({ error: 'Missing jobId' }, { status: 400 })
  const rows = await db.select().from(rfis).where(eq(rfis.jobId, jobId)).orderBy(desc(rfis.rfiNumber))
  return NextResponse.json({ rfis: rows })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { jobId, subject, question, drawingRef, sentTo, dueDate } = body

  if (!jobId || !subject || !question) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

  const existing = await db.select({ rfiNumber: rfis.rfiNumber }).from(rfis).where(eq(rfis.jobId, jobId)).orderBy(desc(rfis.rfiNumber)).limit(1)
  const nextNumber = (existing[0]?.rfiNumber ?? 0) + 1

  const [rfi] = await db.insert(rfis).values({
    jobId,
    rfiNumber: nextNumber,
    subject,
    question,
    drawingRef: drawingRef || null,
    sentTo: sentTo || null,
    dueDate: dueDate || null,
    status: 'open',
  }).returning()

  return NextResponse.json({ rfi })
}
