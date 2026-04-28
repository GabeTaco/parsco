import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { estimateItems } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

function compute(item: Record<string, unknown>) {
  const qty = parseFloat(String(item.qty ?? 0)) || 0
  const laborUnit = parseFloat(String(item.laborUnit ?? 0)) || 0
  const materialUnit = parseFloat(String(item.materialUnit ?? 0)) || 0
  const subUnit = parseFloat(String(item.subUnit ?? 0)) || 0
  const equipUnit = parseFloat(String(item.equipUnit ?? 0)) || 0

  const laborTotal = qty * laborUnit
  const materialTotal = qty * materialUnit
  const subTotal = qty * subUnit
  const equipTotal = qty * equipUnit
  const lineTotal = laborTotal + materialTotal + subTotal + equipTotal

  return { laborTotal, materialTotal, subTotal, equipTotal, lineTotal }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: estimateId } = await params
  const body = await req.json()

  const totals = compute(body)

  const [item] = await db.insert(estimateItems).values({
    estimateId,
    csiDivision: body.csiDivision,
    itemNumber: body.itemNumber ?? null,
    description: body.description,
    qty: String(body.qty ?? 0),
    unit: body.unit ?? null,
    laborUnit: String(body.laborUnit ?? 0),
    laborTotal: String(totals.laborTotal),
    materialUnit: String(body.materialUnit ?? 0),
    materialTotal: String(totals.materialTotal),
    subUnit: String(body.subUnit ?? 0),
    subTotal: String(totals.subTotal),
    equipUnit: String(body.equipUnit ?? 0),
    equipTotal: String(totals.equipTotal),
    lineTotal: String(totals.lineTotal),
    bic: body.bic ?? null,
    sortOrder: body.sortOrder ?? 0,
  }).returning()

  return NextResponse.json({ item })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: estimateId } = await params
  const { items } = await req.json() as { items: Record<string, unknown>[] }

  const results = await db.transaction(async (tx) => {
    const updated = []
    for (const item of items) {
      const totals = compute(item)
      const id = String(item.id)

      if (id.startsWith('tmp_')) {
        const [created] = await tx.insert(estimateItems).values({
          estimateId,
          csiDivision: Number(item.csiDivision),
          itemNumber: String(item.itemNumber ?? ''),
          description: String(item.description),
          qty: String(item.qty ?? 0),
          unit: String(item.unit ?? ''),
          laborUnit: String(item.laborUnit ?? 0),
          laborTotal: String(totals.laborTotal),
          materialUnit: String(item.materialUnit ?? 0),
          materialTotal: String(totals.materialTotal),
          subUnit: String(item.subUnit ?? 0),
          subTotal: String(totals.subTotal),
          equipUnit: String(item.equipUnit ?? 0),
          equipTotal: String(totals.equipTotal),
          lineTotal: String(totals.lineTotal),
          bic: String(item.bic ?? ''),
          sortOrder: Number(item.sortOrder ?? 0),
        }).returning()
        updated.push({ tmpId: id, realId: created.id })
      } else {
        await tx.update(estimateItems)
          .set({
            itemNumber: String(item.itemNumber ?? ''),
            description: String(item.description),
            qty: String(item.qty ?? 0),
            unit: String(item.unit ?? ''),
            laborUnit: String(item.laborUnit ?? 0),
            laborTotal: String(totals.laborTotal),
            materialUnit: String(item.materialUnit ?? 0),
            materialTotal: String(totals.materialTotal),
            subUnit: String(item.subUnit ?? 0),
            subTotal: String(totals.subTotal),
            equipUnit: String(item.equipUnit ?? 0),
            equipTotal: String(totals.equipTotal),
            lineTotal: String(totals.lineTotal),
            bic: String(item.bic ?? ''),
            sortOrder: Number(item.sortOrder ?? 0),
          })
          .where(eq(estimateItems.id, id))
        updated.push({ tmpId: id, realId: id })
      }
    }
    return updated
  })

  return NextResponse.json({ updated: results })
}
