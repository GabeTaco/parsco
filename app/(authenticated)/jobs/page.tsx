import { db } from '@/lib/db'
import { jobs } from '@/lib/db/schema'
import Link from 'next/link'
import Nav from '@/components/Nav'

function formatCurrency(value: string | number) {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num)
}

const statusConfig: Record<string, { label: string; badgeClass: string }> = {
  active:     { label: 'Active',     badgeClass: 'badge badge--active' },
  punch_list: { label: 'Punch List', badgeClass: 'badge badge--punch' },
  bidding:    { label: 'Bidding',    badgeClass: 'badge badge--bidding' },
  complete:   { label: 'Complete',   badgeClass: 'badge badge--complete' },
}

export default async function JobsPage() {
  const allJobs = await db.select().from(jobs).orderBy(jobs.createdAt)

  return (
    <>
      <Nav />
      <main className="page page-jobs">
        <div className="row-between" style={{ marginBottom: '24px' }}>
          <h1 className="page-title" style={{ margin: 0 }}>Jobs</h1>
          <Link href="/jobs/new" className="btn btn-primary">+ New Job</Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {allJobs.map((job) => {
            const status = statusConfig[job.status] ?? statusConfig.active
            const dv = job.daysVariance
            return (
              <Link key={job.id} href={`/jobs/${job.id}`} style={{ textDecoration: 'none' }}>
                <div className="card hoverable">
                  <div className="row-between">
                    <div>
                      <div className="serif" style={{ fontSize: '1.05rem' }}>{job.name}</div>
                      <div className="meta" style={{ marginTop: '4px' }}>{job.clientName}</div>
                    </div>
                    <div className="row">
                      {dv !== 0 && (
                        <span className={dv > 0 ? 'variance--ahead' : 'variance--behind'} style={{ fontSize: '0.8rem', fontWeight: '500' }}>
                          {dv > 0 ? `+${dv}d ahead` : `${Math.abs(dv)}d behind`}
                        </span>
                      )}
                      <span className={status.badgeClass}>{status.label}</span>
                    </div>
                  </div>
                  <div className="row" style={{ marginTop: '14px', gap: '24px' }}>
                    <span className="meta">
                      <span style={{ color: 'var(--text)', fontWeight: '500' }}>{formatCurrency(job.contractValue)}</span>{' '}contract
                    </span>
                    <span className="meta">{job.percentComplete}% complete</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </main>
    </>
  )
}
