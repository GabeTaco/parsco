import { db } from '@/lib/db'
import { jobs, issues, pendingDecisions } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import Nav from '@/components/Nav'
import DigestGenerator from './DigestGenerator'

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

  const activeJobs = await db.select().from(jobs).where(eq(jobs.status, 'active'))

  const openRedIssues = await db
    .select({ id: issues.id, title: issues.title, description: issues.description, jobId: issues.jobId })
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

  const allJobs = await db.select().from(jobs)
  const jobMap: Record<string, string> = {}
  for (const j of allJobs) jobMap[j.id] = j.name

  return (
    <>
      <Nav />
      <main className="page page-digest">
        <div className="section-label">Executive Briefing</div>
        <h1 className="digest-title">{formatWeek(mon, sun)}</h1>

        {/* Stats */}
        <div className="card section" style={{ marginTop: '24px' }}>
          <div className="stats">
            {[
              { label: 'Active Jobs',       value: activeJobs.length },
              { label: 'Red Issues',        value: openRedIssues.length },
              { label: 'Pending Decisions', value: pendingDecs.length },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="stat-num">{stat.value}</div>
                <div className="stat-lbl">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* What changed this week */}
        <section className="section">
          <h2 className="section-heading">What changed this week</h2>
          <DigestGenerator />
        </section>

        {/* Flagged for attention */}
        {openRedIssues.length > 0 && (
          <section className="section">
            <h2 className="section-heading">Flagged for attention</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {openRedIssues.map((issue) => (
                <div key={issue.id} className="card card-strong" style={{ borderLeftColor: 'var(--flag-red)', display: 'flex', gap: '12px', padding: '16px 20px' }}>
                  <span className="flag flag--red" aria-label="critical" style={{ marginTop: '4px' }} />
                  <div>
                    <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{issue.title}</div>
                    <div className="tiny" style={{ marginTop: '4px' }}>{jobMap[issue.jobId] ?? 'Unknown job'}</div>
                    <div style={{ fontSize: '0.85rem', marginTop: '6px', lineHeight: '1.5' }}>{issue.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pending decisions */}
        {pendingDecs.length > 0 && (
          <section className="section">
            <h2 className="section-heading">Pending decisions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pendingDecs.map((dec) => (
                <div key={dec.id} className="card" style={{ padding: '16px 20px' }}>
                  <div style={{ fontWeight: '500', fontSize: '0.9rem', marginBottom: '6px' }}>{dec.title}</div>
                  <div className="tiny">{dec.context}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Looking ahead */}
        {upcomingJobs.length > 0 && (
          <section className="section">
            <h2 className="section-heading">Looking ahead</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {upcomingJobs.map((j) => (
                <div key={j.id} className="card row-between" style={{ padding: '14px 18px' }}>
                  <span style={{ fontSize: '0.9rem' }}>{j.name}</span>
                  <span className="tiny">Target: {formatDate(j.targetCompletionDate)}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  )
}
