import { db } from '@/lib/db'
import { jobs } from '@/lib/db/schema'
import Link from 'next/link'
import Nav from '@/components/Nav'

function formatCurrency(value: string | number) {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num)
}

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  active: { label: 'Active', bg: '#e8f5e9', color: '#2e7d32' },
  punch_list: { label: 'Punch List', bg: '#fffde7', color: '#f57f17' },
  bidding: { label: 'Bidding', bg: '#e3f2fd', color: '#1565c0' },
  complete: { label: 'Complete', bg: '#f5f5f5', color: '#757575' },
}

export default async function JobsPage() {
  const allJobs = await db.select().from(jobs).orderBy(jobs.createdAt)

  return (
    <>
      <Nav />
      <main style={{ padding: '32px 24px', maxWidth: '900px', margin: '0 auto' }}>
        <h1
          className="serif"
          style={{ fontSize: '1.6rem', fontWeight: 'normal', marginBottom: '24px', color: '#1a1512' }}
        >
          Active Jobs
        </h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {allJobs.map((job) => {
            const status = statusConfig[job.status] ?? statusConfig.active
            const dv = job.daysVariance
            return (
              <Link key={job.id} href={`/jobs/${job.id}`} style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #d8cfc2',
                    borderRadius: '8px',
                    padding: '20px 24px',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <div>
                      <h2
                        className="serif"
                        style={{ fontSize: '1.05rem', fontWeight: 'normal', color: '#1a1512', margin: 0 }}
                      >
                        {job.name}
                      </h2>
                      <p style={{ color: '#8a7e74', fontSize: '0.85rem', margin: '4px 0 0' }}>
                        {job.clientName}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {dv !== 0 && (
                        <span
                          style={{
                            fontSize: '0.8rem',
                            color: dv > 0 ? '#2e7d32' : '#6b1f1a',
                            fontWeight: '500',
                          }}
                        >
                          {dv > 0
                            ? `+${dv} days ahead`
                            : `${Math.abs(dv)} days behind`}
                        </span>
                      )}
                      <span
                        style={{
                          backgroundColor: status.bg,
                          color: status.color,
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          padding: '3px 10px',
                          borderRadius: '99px',
                        }}
                      >
                        {status.label}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: '14px',
                      display: 'flex',
                      gap: '24px',
                      fontSize: '0.85rem',
                      color: '#8a7e74',
                    }}
                  >
                    <span>
                      <span style={{ color: '#1a1512', fontWeight: '500' }}>
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
