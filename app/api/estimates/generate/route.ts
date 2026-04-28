import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { ContentBlockParam } from '@anthropic-ai/sdk/resources/messages/messages'
import { db } from '@/lib/db'
import { jobs, estimates, estimateItems } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { buildEstimatePrompt } from '@/lib/prompts/estimate'

function computeTotals(item: Record<string, number>) {
  const qty = item.qty ?? 0
  const laborTotal = qty * (item.laborUnit ?? 0)
  const materialTotal = qty * (item.materialUnit ?? 0)
  const subTotal = qty * (item.subUnit ?? 0)
  const equipTotal = qty * (item.equipUnit ?? 0)
  return { laborTotal, materialTotal, subTotal, equipTotal, lineTotal: laborTotal + materialTotal + subTotal + equipTotal }
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get('pdf') as File | null
    const jobId = form.get('jobId') as string | null

    if (!file || !jobId) return NextResponse.json({ error: 'Missing pdf or jobId' }, { status: 400 })
    if (file.size > 32 * 1024 * 1024) return NextResponse.json({ error: 'PDF must be under 32MB' }, { status: 400 })

    const jobRows = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1)
    if (jobRows.length === 0) return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    const job = jobRows[0]

    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'document' as const,
            source: { type: 'base64' as const, media_type: 'application/pdf' as const, data: base64 },
          },
          {
            type: 'text' as const,
            text: buildEstimatePrompt(job.name, job.siteAddress),
          },
        ] as ContentBlockParam[],
      }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : ''

    let generatedItems: Record<string, unknown>[]
    try {
      const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
      generatedItems = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ error: 'Claude returned unparseable output', raw }, { status: 502 })
    }

    const [estimate] = await db.insert(estimates).values({
      jobId,
      name: `AI Estimate — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
    }).returning()

    await db.transaction(async (tx) => {
      for (let i = 0; i < generatedItems.length; i++) {
        const item = generatedItems[i] as Record<string, number>
        const totals = computeTotals(item)
        await tx.insert(estimateItems).values({
          estimateId: estimate.id,
          csiDivision: Number(item.csiDivision) || 1,
          itemNumber: String((item as Record<string, unknown>).itemNumber ?? ''),
          description: String((item as Record<string, unknown>).description ?? ''),
          qty: String(item.qty ?? 0),
          unit: String((item as Record<string, unknown>).unit ?? 'LS'),
          laborUnit: String(item.laborUnit ?? 0),
          laborTotal: String(totals.laborTotal),
          materialUnit: String(item.materialUnit ?? 0),
          materialTotal: String(totals.materialTotal),
          subUnit: String(item.subUnit ?? 0),
          subTotal: String(totals.subTotal),
          equipUnit: String(item.equipUnit ?? 0),
          equipTotal: String(totals.equipTotal),
          lineTotal: String(totals.lineTotal),
          bic: String((item as Record<string, unknown>).bic ?? ''),
          sortOrder: i,
        })
      }
    })

    return NextResponse.json({ ok: true, estimateId: estimate.id, count: generatedItems.length })
  } catch (err) {
    console.error('Estimate generate error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
