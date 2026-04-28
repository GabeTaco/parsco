import { db } from '@/lib/db'
import { jobs, scheduleActivities } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/Nav'

const CSI: Record<number, string> = {
  1: 'General Requirements', 2: 'Site Construction', 3: 'Concrete',
  4: 'Masonry', 5: 'Metals', 6: 'Wood & Plastics',
  7: 'Thermal & Moisture', 8: 'Doors & Windows', 9: 'Finishes',
  10: 'Specialties', 11: 'Equipment', 12: 'Furnishings',
  13: 'Special Construction', 14: 'Conveying', 15: 'Mechanical', 16: 'Electrical',
}

const statusBadge: Record<string, string> = {
  not_started: 'badge badge--complete',
  in_progress: 'badge badge--active',
  complete: 'badge badge--bidding',
  delayed: 'badge',
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  const [y, m, day] = d.split('-').map(Number)
  return new Date(y, m - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default async function SchedulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const jobRows = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1)
  if (jobRows.length === 0) notFound()
  const job = jobRows[0]

  const activities = await db
    .select()
    .from(scheduleActivities)
    .where(eq(scheduleActivities.jobId, id))
    .orderBy(asc(scheduleActivities.sortOrder))

  return (
    <>
      <Nav />
      <main className="page page-detail">
        <div className="row" style={{ marginBottom: '24px' }}>
          <Link href={`/jobs/${id}`} className="btn btn-ghost">← {job.name}</Link>
        </div>
        <div className="row-between" style={{ marginBottom: '28px' }}>
          <h1 className="page-title" style={{ margin: 0 }}>Schedule</h1>
          <span className="tiny">{activities.filter(a => a.status === 'in_progress').length} active</span>
        </div>

        {activities.length === 0 ? (
          <div className="card muted" style={{ fontSize: '0.85rem', textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: '1.2rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '8px' }}>No activities yet</div>
            <p style={{ margin: 0 }}>Generate a schedule from your estimate to auto-populate activities by CSI division.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {activities.map(act => (
              <div key={act.id} className="card" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: '0.9rem', marginBottom: '2px' }}>{act.title}</div>
                  {act.csiDivision && <div className="tiny">Div {act.csiDivision} — {CSI[act.csiDivision]}</div>}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div className="tiny">{fmtDate(act.startDate)} → {fmtDate(act.endDate)}</div>
                  {act.durationDays && <div className="tiny">{act.durationDays} days</div>}
                </div>
                <div style={{ width: '80px', flexShrink: 0 }}>
                  <div style={{ height: '4px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden', marginBottom: '4px' }}>
                    <div style={{ height: '100%', width: `${act.percentComplete}%`, background: 'linear-gradient(90deg, var(--navy) 0%, var(--skyblue) 100%)' }} />
                  </div>
                  <div className="tiny" style={{ textAlign: 'right' }}>{act.percentComplete}%</div>
                </div>
                <span className={statusBadge[act.status] ?? 'badge'} style={{ flexShrink: 0 }}>{act.status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
