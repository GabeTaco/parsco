import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rfis } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { status, answer, answeredBy } = await req.json()

  await db.update(rfis)
    .set({
      status: status ?? undefined,
      answer: answer ?? undefined,
      answeredBy: answeredBy ?? undefined,
      answeredAt: answer ? new Date() : undefined,
      updatedAt: new Date(),
    })
    .where(eq(rfis.id, id))

  return NextResponse.json({ ok: true })
}
