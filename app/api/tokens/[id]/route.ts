import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { tokens } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.delete(tokens).where(eq(tokens.id, id))
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Token delete error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
