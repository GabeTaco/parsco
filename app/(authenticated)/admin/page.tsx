import { db } from '@/lib/db'
import { tokens, jobs, bids } from '@/lib/db/schema'
import { eq, desc, inArray } from 'drizzle-orm'
import Nav from '@/components/Nav'
import TokenForm from './tokens/TokenForm'
import LinkActions from './tokens/LinkActions'
import AdminTabs from './AdminTabs'
import BidTokenForm from './BidTokenForm'
import BidCard from './BidCard'

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab = 'site-reports' } = await searchParams
  const allJobs = await db.select().from(jobs).orderBy(jobs.name)

  /* ── Site Reports tab ── */
  const siteReportLinks =
    tab === 'site-reports'
      ? await db
          .select({ id: tokens.id, tokenValue: tokens.tokenValue, expiresAt: tokens.expiresAt, jobName: jobs.name })
          .from(tokens)
          .leftJoin(jobs, eq(tokens.jobId, jobs.id))
          .where(eq(tokens.purpose, 'site_report'))
          .orderBy(tokens.createdAt)
      : []

  /* ── Bids tab ── */
  type BidToken = { id: string; tokenValue: string; expiresAt: Date; jobId: string; jobName: string | null }
  let bidTokensByJob: Map<string, { jobName: string; tokens: BidToken[] }> = new Map()
  let bidsByJob: Map<string, typeof bids.$inferSelect[]> = new Map()

  if (tab === 'bids') {
    const bidTokenRows = await db
      .select({ id: tokens.id, tokenValue: tokens.tokenValue, expiresAt: tokens.expiresAt, jobId: tokens.jobId, jobName: jobs.name })
      .from(tokens)
      .leftJoin(jobs, eq(tokens.jobId, jobs.id))
      .where(eq(tokens.purpose, 'bid_submission'))
      .orderBy(tokens.createdAt)

    for (const t of bidTokenRows) {
      if (!bidTokensByJob.has(t.jobId)) {
        bidTokensByJob.set(t.jobId, { jobName: t.jobName ?? 'Unknown job', tokens: [] })
      }
      bidTokensByJob.get(t.jobId)!.tokens.push(t)
    }

    const jobIds = [...bidTokensByJob.keys()]
    if (jobIds.length > 0) {
      const receivedBids = await db
        .select()
        .from(bids)
        .where(inArray(bids.jobId, jobIds))
        .orderBy(desc(bids.submittedAt))

      for (const b of receivedBids) {
        if (!bidsByJob.has(b.jobId)) bidsByJob.set(b.jobId, [])
        bidsByJob.get(b.jobId)!.push(b)
      }
    }
  }

  return (
    <>
      <Nav />
      <main className="page page-detail">
        <h1 className="page-title">Admin</h1>
        <AdminTabs active={tab} />

        {/* ── Site Reports tab ── */}
        {tab === 'site-reports' && (
          <div>
            <TokenForm jobs={allJobs.map((j) => ({ id: j.id, name: j.name }))} />
            <div style={{ marginTop: '40px' }}>
              <div className="section-label" style={{ marginBottom: '16px' }}>Active Links</div>
              {siteReportLinks.length === 0 ? (
                <div className="card muted" style={{ fontSize: '0.85rem' }}>No links yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {siteReportLinks.map((link) => (
                    <div key={link.id} className="card" style={{ padding: '16px 20px' }}>
                      <div className="row-between">
                        <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{link.jobName ?? 'Unknown job'}</div>
                        <div className="tiny">Good until {formatDate(link.expiresAt)}</div>
                      </div>
                      <LinkActions tokenId={link.id} tokenValue={link.tokenValue} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Bids tab ── */}
        {tab === 'bids' && (
          <div>
            <BidTokenForm jobs={allJobs.map((j) => ({ id: j.id, name: j.name }))} />

            <div style={{ marginTop: '40px' }}>
              <div className="section-label" style={{ marginBottom: '16px' }}>Active Bid Links</div>
              {bidTokensByJob.size === 0 ? (
                <div className="card muted" style={{ fontSize: '0.85rem' }}>No bid links yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[...bidTokensByJob.entries()].map(([jobId, group]) => {
                    const jobBids = bidsByJob.get(jobId) ?? []
                    return (
                      <div key={jobId} className="card" style={{ padding: '0' }}>
                        {/* Job header */}
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                          <div className="row-between" style={{ marginBottom: '12px' }}>
                            <div style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--navy)' }}>{group.jobName}</div>
                            <div className="tiny">{group.tokens.length} link{group.tokens.length !== 1 ? 's' : ''}</div>
                          </div>
                          {/* Bid links for this job */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {group.tokens.map((t) => (
                              <div key={t.id} style={{ background: 'var(--bg)', borderRadius: '3px', padding: '10px 14px' }}>
                                <div className="row-between">
                                  <span className="tiny">Bid link</span>
                                  <span className="tiny">Good until {formatDate(t.expiresAt)}</span>
                                </div>
                                <LinkActions tokenId={t.id} tokenValue={t.tokenValue} />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Received bids */}
                        <div style={{ padding: '16px 20px' }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                            Submissions ({jobBids.length})
                          </div>
                          {jobBids.length === 0 ? (
                            <p className="muted" style={{ fontSize: '0.85rem', marginTop: '8px' }}>No bids received yet.</p>
                          ) : (
                            jobBids.map((b) => (
                              <BidCard
                                key={b.id}
                                bid={{
                                  id: b.id,
                                  subcontractorName: b.subcontractorName,
                                  trade: b.trade,
                                  totalAmount: String(b.totalAmount),
                                  status: b.status,
                                  bidDate: String(b.bidDate),
                                  submittedAt: b.submittedAt.toISOString(),
                                  reviewNotes: b.reviewNotes,
                                }}
                              />
                            ))
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  )
}
