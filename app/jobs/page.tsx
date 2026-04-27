import { db } from '@/lib/db'
import { jobs } from '@/lib/db/schema'
import Link from 'next/link'
import Nav from '@/components/Nav'

function formatCurrency(value: string | number) {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num)
}

const statusConfig: Record<string, { label: string; badgeClass: string }> = {
  active: { label: 'Active', badgeClass: 'badge badge--active' },
  punch_list: { label: 'Punch List', badgeClass: 'badge badge--punch-list' },
  bidding: { label: 'Bidding', badgeClass: 'badge badge--bidding' },
  complete: { label: 'Complete', badgeClass: 'badge badge--complete' },
}

export default async function JobsPage() {
  const allJobs = await db.select().from(jobs).orderBy(jobs.createdAt)

  return (
    <>
      <Nav />
      <main className="page-shell">
        <h1 className="serif page-title">Active Jobs</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {allJobs.map((job) => {
            const status = statusConfig[job.status] ?? statusConfig.active
            const dv = job.daysVariance
            return (
              <Link key={job.id} href={`/jobs/${job.id}`} style={{ textDecoration: 'none' }}>
                <div
                  className="card"
                  style={{ cursor: 'pointer', transition: 'border-color 0.15s' }}
                >
                  <div className="row--top">
                    <div>
                      <h2
                        className="serif"
                        style={{ fontSize: '1.05rem', fontWeight: 'normal', margin: 0 }}
                      >
                        {job.name}
                      </h2>
                      <p className="muted" style={{ fontSize: '0.85rem', margin: '4px 0 0' }}>
                        {job.clientName}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {dv !== 0 && (
                        <span
                          className={dv > 0 ? 'variance--ahead' : 'variance--behind'}
                          style={{ fontSize: '0.8rem', fontWeight: '500' }}
                        >
                          {dv > 0
                            ? `+${dv} days ahead`
                            : `${Math.abs(dv)} days behind`}
                        </span>
                      )}
                      <span className={status.badgeClass}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                  <div
                    className="muted"
                    style={{ marginTop: '14px', display: 'flex', gap: '24px', fontSize: '0.85rem' }}
                  >
                    <span>
                      <span style={{ color: 'var(--text)', fontWeight: '500' }}>
                        {formatCurrency(job.contractValue)}
                      </span>{' '}
                      contract
                    </span>
                    <span>{job.percentComplete}% complete</span>
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
