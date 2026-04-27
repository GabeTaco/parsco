import { db } from '@/lib/db'
import { jobs, issues, siteReports } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Nav from '@/components/Nav'

function formatCurrency(value: string | number) {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(num)
}

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  active: { label: 'Active', bg: '#e8f5e9', color: '#2e7d32' },
  punch_list: { label: 'Punch List', bg: '#fffde7', color: '#f57f17' },
  bidding: { label: 'Bidding', bg: '#e3f2fd', color: '#1565c0' },
  complete: { label: 'Complete', bg: '#f5f5f5', color: '#757575' },
}

const flagDot: Record<string, string> = {
  red: '#c0392b',
  yellow: '#e67e22',
  green: '#27ae60',
}

const flagOrder: Record<string, number> = { red: 0, yellow: 1, green: 2 }

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const jobRows = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1)
  if (jobRows.length === 0) notFound()
  const job = jobRows[0]

  const allIssues = await db
    .select()
    .from(issues)
    .where(and(eq(issues.jobId, id), eq(issues.isOpen, true)))

  const sortedIssues = allIssues.sort(
    (a, b) => (flagOrder[a.flagColor] ?? 3) - (flagOrder[b.flagColor] ?? 3)
  )

  const reports = await db
    .select()
    .from(siteReports)
    .where(eq(siteReports.jobId, id))
    .orderBy(desc(siteReports.reportDate))

  const status = statusConfig[job.status] ?? statusConfig.active
  const contractNum = parseFloat(String(job.contractValue))
  const spendNum = parseFloat(String(job.currentSpend))
  const variance = contractNum - spendNum
  const isOverBudget = variance < 0

  return (
    <>
      <Nav />
      <main style={{ padding: '32px 24px', maxWidth: '780px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <h1
              className="serif"
              style={{ fontSize: '1.6rem', fontWeight: 'normal', color: '#1a1512', margin: 0 }}
            >
              {job.name}
            </h1>
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
          <p style={{ color: '#8a7e74', fontSize: '0.9rem', margin: '4px 0' }}>{job.clientName}</p>
          <p style={{ color: '#8a7e74', fontSize: '0.85rem', margin: '2px 0' }}>{job.siteAddress}</p>
        </div>

        {/* Schedule + Budget grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          {/* Schedule */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #d8cfc2',
              borderRadius: '8px',
              padding: '20px',
            }}
          >
            <h3
              style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8a7e74', margin: '0 0 16px' }}
            >
              Schedule
            </h3>
            <div style={{ fontSize: '0.85rem', color: '#1a1512', marginBottom: '4px' }}>
              {formatDate(job.startDate)} → {formatDate(job.targetCompletionDate)}
            </div>
            {job.daysVariance !== 0 && (
              <div
                style={{
                  fontSize: '0.82rem',
                  color: job.daysVariance > 0 ? '#2e7d32' : '#6b1f1a',
                  marginBottom: '12px',
                }}
              >
                {job.daysVariance > 0
                  ? `+${job.daysVariance} days ahead of schedule`
                  : `${Math.abs(job.daysVariance)} days behind schedule`}
              </div>
            )}
            <div style={{ marginTop: '12px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  color: '#8a7e74',
                  marginBottom: '6px',
                }}
              >
                <span>Progress</span>
                <span>{job.percentComplete}%</span>
              </div>
              <div
                style={{
                  height: '6px',
                  backgroundColor: '#d8cfc2',
                  borderRadius: '99px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${job.percentComplete}%`,
                    backgroundColor: '#6b1f1a',
                    borderRadius: '99px',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Budget */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #d8cfc2',
              borderRadius: '8px',
              padding: '20px',
            }}
          >
            <h3
              style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8a7e74', margin: '0 0 16px' }}
            >
              Budget
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#8a7e74' }}>Contract</span>
                <span style={{ color: '#1a1512' }}>{formatCurrency(contractNum)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#8a7e74' }}>Current Spend</span>
                <span style={{ color: '#1a1512' }}>{formatCurrency(spendNum)}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '8px',
                  borderTop: '1px solid #d8cfc2',
                }}
              >
                <span style={{ color: '#8a7e74' }}>Remaining</span>
                <span style={{ color: isOverBudget ? '#6b1f1a' : '#2e7d32', fontWeight: '600' }}>
                  {isOverBudget ? '-' : ''}{formatCurrency(Math.abs(variance))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Open Issues */}
        {sortedIssues.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h2
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#8a7e74',
                margin: '0 0 12px',
              }}
            >
              Open Issues
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sortedIssues.map((issue) => (
                <div
                  key={issue.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #d8cfc2',
                    borderRadius: '8px',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: flagDot[issue.flagColor] ?? '#ccc',
                      marginTop: '3px',
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '500', color: '#1a1512', marginBottom: '4px' }}>
                      {issue.title}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#8a7e74', lineHeight: '1.5' }}>
                      {issue.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {reports.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h2
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#8a7e74',
                margin: '0 0 12px',
              }}
            >
              Recent Activity
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reports.map((report) => (
                <div
                  key={report.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #d8cfc2',
                    borderRadius: '8px',
                    padding: '20px 24px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '12px',
                    }}
                  >
                    <span style={{ fontWeight: '500', fontSize: '0.9rem', color: '#1a1512' }}>
                      {report.superName}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: '#8a7e74' }}>
                      {formatDate(report.reportDate)}
                    </span>
                  </div>
                  {report.digestText ? (
                    <p
                      style={{
                        fontSize: '0.9rem',
                        color: '#1a1512',
                        lineHeight: '1.6',
                        margin: 0,
                      }}
                    >
                      {report.digestText}
                    </p>
                  ) : (
                    <p
                      style={{
                        fontSize: '0.9rem',
                        color: '#8a7e74',
                        lineHeight: '1.6',
                        margin: 0,
                      }}
                    >
                      {report.workCompleted}
                    </p>
                  )}
                  {(report.blockers) && (
                    <div
                      style={{
                        marginTop: '12px',
                        padding: '10px 14px',
                        backgroundColor: '#fdf4f4',
                        border: '1px solid #f5d0d0',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        color: '#6b1f1a',
                      }}
                    >
                      <strong>Blocker:</strong> {report.blockers}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents */}
        <div>
          <h2
            style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#8a7e74',
              margin: '0 0 12px',
            }}
          >
            Documents
          </h2>
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #d8cfc2',
              borderRadius: '8px',
              padding: '20px 24px',
              color: '#8a7e74',
              fontSize: '0.85rem',
            }}
          >
            Document vault coming soon.
          </div>
        </div>
      </main>
    </>
  )
}
