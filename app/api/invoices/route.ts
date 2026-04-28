import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { invoices } from '@/lib/db/schema'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { jobId, invoiceNumber, vendor, description, csiDivision, amount, invoiceDate, dueDate } = body

  if (!jobId || !vendor || !amount || !invoiceDate) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

  const [invoice] = await db.insert(invoices).values({
    jobId,
    invoiceNumber: invoiceNumber || null,
    vendor,
    description: description || null,
    csiDivision: csiDivision || null,
    amount: String(amount),
    invoiceDate,
    dueDate: dueDate || null,
    status: 'pending',
  }).returning()

  return NextResponse.json({ invoice })
}
