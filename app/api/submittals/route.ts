import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { submittals } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { jobId, submittalNumber, specSection, description, submittedBy, dueDate } = body

  if (!jobId || !description || !submittalNumber) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

  const [submittal] = await db.insert(submittals).values({
    jobId,
    submittalNumber,
    specSection: specSection || null,
    description,
    submittedBy: submittedBy || null,
    dueDate: dueDate || null,
    status: 'pending',
    submittedAt: new Date(),
  }).returning()

  return NextResponse.json({ submittal })
}
