import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { bids, bidLineItems } from '@/lib/db/schema'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      jobId, subcontractorName, subcontractorEmail, trade, bidDate,
      validUntil, totalAmount, inclusions, exclusions, qualifications,
      rawSubmissionData, lineItems = [],
    } = body

    if (!jobId || !subcontractorName || !trade || !bidDate || !totalAmount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await db.transaction(async (tx) => {
      const [bid] = await tx
        .insert(bids)
        .values({
          jobId,
          subcontractorName,
          subcontractorEmail: subcontractorEmail || null,
          trade,
          bidDate,
          validUntil: validUntil || null,
          totalAmount: String(totalAmount),
          status: 'submitted',
          inclusions: inclusions || null,
          exclusions: exclusions || null,
          qualifications: qualifications || null,
          rawSubmissionData: rawSubmissionData || null,
        })
        .returning()

      if (lineItems.length > 0) {
        await tx.insert(bidLineItems).values(
          lineItems.map((li: { sortOrder: number; description: string; quantity?: number | null; unit?: string | null; unitPrice?: number | null; totalPrice: number; notes?: string | null }) => ({
            bidId: bid.id,
            sortOrder: li.sortOrder,
            description: li.description,
            quantity: li.quantity != null ? String(li.quantity) : null,
            unit: li.unit || null,
            unitPrice: li.unitPrice != null ? String(li.unitPrice) : null,
            totalPrice: String(li.totalPrice),
            notes: li.notes || null,
          }))
        )
      }

      return bid
    })

    return NextResponse.json({ ok: true, id: result.id })
  } catch (err) {
    console.error('Bid create error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
