import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { estimateItems } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  const { itemId } = await params
  await db.delete(estimateItems).where(eq(estimateItems.id, itemId))
  return NextResponse.json({ ok: true })
}
