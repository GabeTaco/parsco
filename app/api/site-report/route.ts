import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { tokens, siteReports, jobs } from '@/lib/db/schema'
import { eq, and, gt } from 'drizzle-orm'
import Anthropic from '@anthropic-ai/sdk'
import { buildSiteReportPrompt } from '@/lib/prompts/site-report'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tokenValue, superName, reportDate, workCompleted, blockers } = body

    if (!tokenValue || !superName || !reportDate || !workCompleted) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate token
    const now = new Date()
    const tokenRows = await db
      .select()
      .from(tokens)
      .where(and(eq(tokens.tokenValue, tokenValue), gt(tokens.expiresAt, now)))
      .limit(1)

    if (tokenRows.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    const token = tokenRows[0]

    // Get job info
    const jobRows = await db.select().from(jobs).where(eq(jobs.id, token.jobId)).limit(1)
    if (jobRows.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }
    const job = jobRows[0]

    // Insert site report
    const [report] = await db
      .insert(siteReports)
      .values({
        jobId: token.jobId,
        superName,
        reportDate,
        workCompleted,
        blockers: blockers || null,
        rawSubmissionData: body,
      })
      .returning()

    // Generate digest via Anthropic if key is not placeholder
    let digestText: string | null = null
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (apiKey && apiKey !== 'placeholder_replace_me') {
      try {
        const client = new Anthropic({ apiKey })
        const prompt = buildSiteReportPrompt({
          jobName: job.name,
          clientName: job.clientName,
          status: job.status,
          superName,
          reportDate,
          workCompleted,
          blockers: blockers || null,
        })
        const message = await client.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 300,
          messages: [{ role: 'user', content: prompt }],
        })
        const block = message.content[0]
        if (block.type === 'text') {
          digestText = block.text
        }
      } catch (err) {
        console.error('Anthropic digest generation failed:', err)
      }
    }

    // Update with digest
    if (digestText) {
      await db
        .update(siteReports)
        .set({ digestText })
        .where(eq(siteReports.id, report.id))
    }

    return NextResponse.json({ ok: true, reportId: report.id })
  } catch (err) {
    console.error('Site report submission error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
