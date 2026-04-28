import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { submittals } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { status, reviewerNotes, reviewedBy } = await req.json()

  await db.update(submittals)
    .set({
      status: status ?? undefined,
      reviewerNotes: reviewerNotes ?? undefined,
      reviewedBy: reviewedBy ?? undefined,
      reviewedAt: status && status !== 'pending' ? new Date() : undefined,
      updatedAt: new Date(),
    })
    .where(eq(submittals.id, id))

  return NextResponse.json({ ok: true })
}
