import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { asks, askResponses, activityLog } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const { token, formData } = await req.json()

    if (!token || !formData) {
      return NextResponse.json({ error: 'Missing token or form data' }, { status: 400 })
    }

    const rows = await db.select().from(asks).where(eq(asks.tokenValue, token)).limit(1)
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 })
    }

    const ask = rows[0]

    if (ask.status === 'responded') {
      return NextResponse.json({ error: 'Already submitted' }, { status: 409 })
    }

    if (ask.expiresAt && new Date(ask.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Link expired' }, { status: 410 })
    }

    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? null
    const ua = req.headers.get('user-agent') ?? null

    await db.transaction(async (tx) => {
      await tx.insert(askResponses).values({
        askId: ask.id,
        responseData: formData,
        ipAddress: ip,
        userAgent: ua,
      })

      await tx.update(asks)
        .set({ status: 'responded', respondedAt: new Date(), updatedAt: new Date() })
        .where(eq(asks.id, ask.id))

      await tx.insert(activityLog).values({
        askId: ask.id,
        jobId: ask.jobId,
        entityType: 'ask',
        entityId: ask.id,
        action: 'responded',
        actor: ask.recipientEmail ?? 'external',
        meta: { formSchemaId: ask.formSchemaId },
      })
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Ask response error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
