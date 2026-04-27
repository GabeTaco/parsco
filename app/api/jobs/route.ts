import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { jobs } from '@/lib/db/schema'

export async function POST(req: NextRequest) {
  try {
    const { name, clientName, siteAddress, contractValue, startDate, targetCompletionDate, status } = await req.json()

    if (!name || !clientName || !siteAddress || !contractValue || !startDate || !targetCompletionDate) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const [job] = await db
      .insert(jobs)
      .values({
        name,
        clientName,
        siteAddress,
        contractValue: String(contractValue),
        currentSpend: '0',
        status: status ?? 'bidding',
        startDate,
        targetCompletionDate,
        percentComplete: 0,
        daysVariance: 0,
      })
      .returning({ id: jobs.id })

    return NextResponse.json({ ok: true, id: job.id })
  } catch (err) {
    console.error('Job create error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
