import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { invoices } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { status, paidDate } = await req.json()

  await db.update(invoices)
    .set({ status: status ?? undefined, paidDate: paidDate ?? undefined, updatedAt: new Date() })
    .where(eq(invoices.id, id))

  return NextResponse.json({ ok: true })
}
