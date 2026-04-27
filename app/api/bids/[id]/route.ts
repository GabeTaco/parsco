import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { bids, bidLineItems } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const bidRows = await db.select().from(bids).where(eq(bids.id, id)).limit(1)
    if (bidRows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const lineItems = await db
      .select()
      .from(bidLineItems)
      .where(eq(bidLineItems.bidId, id))
      .orderBy(asc(bidLineItems.sortOrder))
    return NextResponse.json({ bid: bidRows[0], lineItems })
  } catch (err) {
    console.error('Bid fetch error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { status, reviewNotes } = await req.json()
    await db
      .update(bids)
      .set({ status, reviewNotes: reviewNotes ?? null, updatedAt: new Date() })
      .where(eq(bids.id, id))
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Bid update error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.delete(bids).where(eq(bids.id, id))
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Bid delete error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
