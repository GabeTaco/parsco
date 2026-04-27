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

const statusConfig: Record<string, { label: string; badgeClass: string }> = {
  active: { label: 'Active', badgeClass: 'badge badge--active' },
  punch_list: { label: 'Punch List', badgeClass: 'badge badge--punch-list' },
  bidding: { label: 'Bidding', badgeClass: 'badge badge--bidding' },
  complete: { label: 'Complete', badgeClass: 'badge badge--complete' },
}

const flagDotClass: Record<string, string> = {
  red: 'flag-dot flag-dot--red',
  yellow: 'flag-dot flag-dot--yellow',
  green: 'flag-dot flag-dot--green',
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
      <main className="page-shell--narrow">
        {/* Header */}
        <div className="section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <h1
              className="serif page-title"
              style={{ margin: 0 }}
            >
              {job.name}
            </h1>
            <span className={status.badgeClass}>
              {status.label}
            </span>
          </div>
          <p className="muted" style={{ fontSize: '0.9rem', margin: '4px 0' }}>{job.clientName}</p>
          <p className="muted" style={{ fontSize: '0.85rem', margin: '2px 0' }}>{job.siteAddress}</p>
        </div>

        {/* Schedule + Budget grid */}
        <div className="two-col section">
          {/* Schedule */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 className="section-label" style={{ margin: '0 0 16px' }}>Schedule</h3>
            <div className="body-sm" style={{ marginBottom: '4px' }}>
              {formatDate(job.startDate)} → {formatDate(job.targetCompletionDate)}
            </div>
            {job.daysVariance !== 0 && (
              <div
                className={job.daysVariance > 0 ? 'variance--ahead' : 'variance--behind'}
                style={{ fontSize: '0.82rem', marginBottom: '12px' }}
              >
                {job.daysVariance > 0
                  ? `+${job.daysVariance} days ahead of schedule`
                  : `${Math.abs(job.daysVariance)} days behind schedule`}
              </div>
            )}
            <div style={{ marginTop: '12px' }}>
              <div className="row muted" style={{ fontSize: '0.8rem', marginBottom: '6px' }}>
                <span>Progress</span>
                <span>{job.percentComplete}%</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${job.percentComplete}%` }}
                />
              </div>
            </div>
          </div>

          {/* Budget */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 className="section-label" style={{ margin: '0 0 16px' }}>Budget</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <div className="row">
                <span className="muted">Contract</span>
                <span>{formatCurrency(contractNum)}</span>
              </div>
              <div className="row">
                <span className="muted">Current Spend</span>
                <span>{formatCurrency(spendNum)}</span>
              </div>
              <div
                className="row"
                style={{ paddingTop: '8px', borderTop: '1px solid var(--border)' }}
              >
                <span className="muted">Remaining</span>
                <span
                  className={isOverBudget ? 'variance--behind' : 'variance--ahead'}
                  style={{ fontWeight: '600' }}
                >
                  {isOverBudget ? '-' : ''}{formatCurrency(Math.abs(variance))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Open Issues */}
        {sortedIssues.length > 0 && (
          <div className="section">
            <h2 className="section-label">Open Issues</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sortedIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="card--sm"
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}
                >
                  <div
                    className={flagDotClass[issue.flagColor] ?? 'flag-dot'}
                    style={!flagDotClass[issue.flagColor] ? { background: '#ccc' } : undefined}
                  />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '4px' }}>
                      {issue.title}
                    </div>
                    <div className="body-xs">{issue.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {reports.length > 0 && (
          <div className="section">
            <h2 className="section-label">Recent Activity</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reports.map((report) => (
                <div key={report.id} className="card">
                  <div className="row" style={{ marginBottom: '12px' }}>
                    <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>
                      {report.superName}
                    </span>
                    <span className="body-xs">{formatDate(report.reportDate)}</span>
                  </div>
                  {report.digestText ? (
                    <p style={{ fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                      {report.digestText}
                    </p>
                  ) : (
                    <p className="muted" style={{ fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                      {report.workCompleted}
                    </p>
                  )}
                  {report.blockers && (
                    <div className="blocker-callout">
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
          <h2 className="section-label">Documents</h2>
          <div className="card muted" style={{ fontSize: '0.85rem' }}>
            Document vault coming soon.
          </div>
        </div>
      </main>
    </>
  )
}
