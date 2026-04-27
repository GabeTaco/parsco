import { db } from '@/lib/db'
import { jobs, siteReports, issues, pendingDecisions } from '@/lib/db/schema'
import { eq, and, gte, lte } from 'drizzle-orm'
import Nav from '@/components/Nav'
import Anthropic from '@anthropic-ai/sdk'

export const revalidate = 300 // 5 minutes

function getWeekBounds() {
  const now = new Date()
  const day = now.getDay()
  const mon = new Date(now)
  mon.setDate(now.getDate() - ((day + 6) % 7))
  mon.setHours(0, 0, 0, 0)
  const sun = new Date(mon)
  sun.setDate(mon.getDate() + 6)
  sun.setHours(23, 59, 59, 999)
  return { mon, sun }
}

function formatWeek(mon: Date, sun: Date) {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  return `Week of ${mon.toLocaleDateString('en-US', opts)} – ${sun.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`
}

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function DigestPage() {
  const { mon, sun } = getWeekBounds()
  const now = new Date()
  const in14Days = new Date(now)
  in14Days.setDate(now.getDate() + 14)

  // Fetch all needed data
  const activeJobs = await db.select().from(jobs).where(eq(jobs.status, 'active'))

  const weeklyReports = await db
    .select()
    .from(siteReports)
    .where(
      and(
        gte(siteReports.submittedAt, mon),
        lte(siteReports.submittedAt, sun)
      )
    )
    .orderBy(siteReports.submittedAt)

  const weeklyIssues = await db
    .select()
    .from(issues)
    .where(
      and(
        eq(issues.isOpen, true),
        gte(issues.updatedAt, mon)
      )
    )

  const openRedIssues = await db
    .select({
      id: issues.id,
      title: issues.title,
      description: issues.description,
      flagColor: issues.flagColor,
      jobId: issues.jobId,
    })
    .from(issues)
    .where(and(eq(issues.isOpen, true), eq(issues.flagColor, 'red')))

  const pendingDecs = await db
    .select()
    .from(pendingDecisions)
    .where(eq(pendingDecisions.isPending, true))

  const in14DayStr = in14Days.toISOString().slice(0, 10)
  const todayStr = now.toISOString().slice(0, 10)
  const upcomingJobs = activeJobs.filter(
    (j) => j.targetCompletionDate >= todayStr && j.targetCompletionDate <= in14DayStr
  )

  // Build job name map
  const jobMap: Record<string, string> = {}
  for (const j of activeJobs) jobMap[j.id] = j.name
  // Also need all jobs for red issues
  const allJobs = await db.select().from(jobs)
  for (const j of allJobs) jobMap[j.id] = j.name

  // Try to generate AI digest
  let aiDigest: string | null = null
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (apiKey && apiKey !== 'placeholder_replace_me') {
    try {
      const client = new Anthropic({ apiKey })
      const reportsGrouped = activeJobs.map((j) => {
        const jReports = weeklyReports.filter((r) => r.jobId === j.id)
        return { job: j.name, reports: jReports.map((r) => r.digestText || r.workCompleted) }
      })

      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 600,
        messages: [
          {
            role: 'user',
            content: `You are writing a weekly executive briefing for the CEO of a general contracting firm. He reads this on Sunday night. Be direct, no fluff.

Active jobs and their state:
${JSON.stringify(activeJobs.map((j) => ({ name: j.name, status: j.status, percentComplete: j.percentComplete, daysVariance: j.daysVariance })), null, 2)}

Site reports from this week:
${JSON.stringify(reportsGrouped, null, 2)}

New or updated issues this week:
${JSON.stringify(weeklyIssues.map((i) => ({ title: i.title, flagColor: i.flagColor, description: i.description })), null, 2)}

Write a "What changed this week" section. Group by job. One bulleted line per change. No preamble. Bold any flag-worthy items.`,
          },
        ],
      })
      const block = message.content[0]
      if (block.type === 'text') aiDigest = block.text
    } catch (err) {
      console.error('Weekly digest generation failed:', err)
    }
  }

  const generatedAt = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <>
      <Nav />
      <main style={{ padding: '48px 24px', maxWidth: '680px', margin: '0 auto' }}>
        <p style={{ color: '#8a7e74', fontSize: '0.82rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Executive Briefing
        </p>
        <h1
          className="serif"
          style={{ fontSize: '1.8rem', fontWeight: 'normal', marginBottom: '32px', color: '#1a1512' }}
        >
          {formatWeek(mon, sun)}
        </h1>

        {/* Stat blocks */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginBottom: '40px',
          }}
        >
          {[
            { label: 'Active Jobs', value: activeJobs.length },
            { label: 'Red Issues', value: openRedIssues.length },
            { label: 'Pending Decisions', value: pendingDecs.length },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #d8cfc2',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
              }}
            >
              <div
                className="serif"
                style={{ fontSize: '2rem', fontWeight: 'normal', color: '#1a1512', lineHeight: 1 }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#8a7e74', marginTop: '6px' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* What changed this week */}
        <section style={{ marginBottom: '40px' }}>
          <h2
            className="serif"
            style={{ fontSize: '1.1rem', fontWeight: 'normal', color: '#1a1512', marginBottom: '16px' }}
          >
            What changed this week
          </h2>
          {aiDigest ? (
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #d8cfc2',
                borderRadius: '8px',
                padding: '24px',
                fontSize: '0.9rem',
                lineHeight: '1.7',
                color: '#1a1512',
                whiteSpace: 'pre-wrap',
              }}
            >
              {aiDigest}
            </div>
          ) : weeklyReports.length > 0 ? (
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #d8cfc2',
                borderRadius: '8px',
                padding: '24px',
              }}
            >
              {activeJobs.map((job) => {
                const jReports = weeklyReports.filter((r) => r.jobId === job.id)
                if (jReports.length === 0) return null
                return (
                  <div key={job.id} style={{ marginBottom: '16px' }}>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '6px', color: '#1a1512' }}>
                      {job.name}
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '18px' }}>
                      {jReports.map((r) => (
                        <li key={r.id} style={{ fontSize: '0.87rem', color: '#1a1512', lineHeight: '1.6', marginBottom: '4px' }}>
                          {r.digestText || r.workCompleted}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          ) : (
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #d8cfc2',
                borderRadius: '8px',
                padding: '24px',
                color: '#8a7e74',
                fontSize: '0.9rem',
              }}
            >
              {apiKey === 'placeholder_replace_me'
                ? 'AI briefing unavailable — add a valid ANTHROPIC_API_KEY to enable. Showing raw report data below.'
                : 'No site reports submitted this week.'}
            </div>
          )}
        </section>

        {/* Flagged for attention */}
        {openRedIssues.length > 0 && (
          <section style={{ marginBottom: '40px' }}>
            <h2
              className="serif"
              style={{ fontSize: '1.1rem', fontWeight: 'normal', color: '#1a1512', marginBottom: '16px' }}
            >
              Flagged for attention
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {openRedIssues.map((issue) => (
                <div
                  key={issue.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #f5d0d0',
                    borderRadius: '8px',
                    padding: '16px 20px',
                    display: 'flex',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: '#c0392b',
                      marginTop: '4px',
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: '500', fontSize: '0.9rem', color: '#1a1512' }}>
                      {issue.title}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#8a7e74', marginTop: '4px' }}>
                      {jobMap[issue.jobId] ?? 'Unknown job'}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#1a1512', marginTop: '6px', lineHeight: '1.5' }}>
                      {issue.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pending decisions */}
        {pendingDecs.length > 0 && (
          <section style={{ marginBottom: '40px' }}>
            <h2
              className="serif"
              style={{ fontSize: '1.1rem', fontWeight: 'normal', color: '#1a1512', marginBottom: '16px' }}
            >
              Pending decisions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pendingDecs.map((dec) => (
                <div
                  key={dec.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #d8cfc2',
                    borderRadius: '8px',
                    padding: '16px 20px',
                  }}
                >
                  <div style={{ fontWeight: '500', fontSize: '0.9rem', color: '#1a1512', marginBottom: '6px' }}>
                    {dec.title}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#8a7e74', lineHeight: '1.5' }}>
                    {dec.context}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Looking ahead */}
        {upcomingJobs.length > 0 && (
          <section style={{ marginBottom: '40px' }}>
            <h2
              className="serif"
              style={{ fontSize: '1.1rem', fontWeight: 'normal', color: '#1a1512', marginBottom: '16px' }}
            >
              Looking ahead
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {upcomingJobs.map((j) => (
                <div
                  key={j.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #d8cfc2',
                    borderRadius: '8px',
                    padding: '14px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.9rem', color: '#1a1512' }}>{j.name}</span>
                  <span style={{ fontSize: '0.82rem', color: '#8a7e74' }}>
                    Target: {formatDate(j.targetCompletionDate)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        <p style={{ fontSize: '0.75rem', color: '#8a7e74', borderTop: '1px solid #d8cfc2', paddingTop: '16px' }}>
          Generated {generatedAt}
        </p>
      </main>
    </>
  )
}
