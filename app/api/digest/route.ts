import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { jobs, siteReports, issues } from '@/lib/db/schema'
import { eq, and, gte, lte } from 'drizzle-orm'
import Anthropic from '@anthropic-ai/sdk'
import { buildWeeklyDigestPrompt } from '@/lib/prompts/weekly-digest'

export async function POST() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'placeholder_replace_me') {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 503 })
  }

  const now = new Date()
  const day = now.getDay()
  const mon = new Date(now)
  mon.setDate(now.getDate() - ((day + 6) % 7))
  mon.setHours(0, 0, 0, 0)
  const sun = new Date(mon)
  sun.setDate(mon.getDate() + 6)
  sun.setHours(23, 59, 59, 999)

  const activeJobs = await db.select().from(jobs).where(eq(jobs.status, 'active'))

  const weeklyReports = await db
    .select()
    .from(siteReports)
    .where(and(gte(siteReports.submittedAt, mon), lte(siteReports.submittedAt, sun)))

  const weeklyIssues = await db
    .select()
    .from(issues)
    .where(and(eq(issues.isOpen, true), gte(issues.updatedAt, mon)))

  const reportsGrouped = activeJobs.map((j) => ({
    job: j.name,
    reports: weeklyReports
      .filter((r) => r.jobId === j.id)
      .map((r) => r.digestText || r.workCompleted),
  }))

  const prompt = buildWeeklyDigestPrompt({
    activeJobs: activeJobs.map((j) => ({
      name: j.name,
      status: j.status,
      percentComplete: j.percentComplete,
      daysVariance: j.daysVariance,
    })),
    reportsGrouped,
    weeklyIssues: weeklyIssues.map((i) => ({
      title: i.title,
      flagColor: i.flagColor,
      description: i.description,
    })),
  })

  const client = new Anthropic({ apiKey })
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    messages: [{ role: 'user', content: prompt }],
  })

  const block = message.content[0]
  const text = block.type === 'text' ? block.text : ''

  return NextResponse.json({ digest: text, generatedAt: new Date().toISOString() })
}
