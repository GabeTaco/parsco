import { db } from '@/lib/db'
import { tokens, jobs } from '@/lib/db/schema'
import { and, eq, gt } from 'drizzle-orm'
import BidForm from './BidForm'

export default async function BidSubmissionPage({ params }: { params: Promise<{ token: string }> }) {
  const { token: tokenValue } = await params
  const now = new Date()

  const tokenRows = await db
    .select()
    .from(tokens)
    .where(and(eq(tokens.tokenValue, tokenValue), gt(tokens.expiresAt, now), eq(tokens.purpose, 'bid_submission')))
    .limit(1)

  if (tokenRows.length === 0) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="card" style={{ maxWidth: '400px', textAlign: 'center', padding: '40px 32px' }}>
          <h1 className="serif" style={{ fontSize: '1.3rem', fontWeight: '600', color: 'var(--navy)', marginBottom: '12px' }}>
            Link Expired
          </h1>
          <p className="muted" style={{ fontSize: '0.9rem' }}>
            This bid link is no longer valid. Contact the project manager for a new link.
          </p>
        </div>
      </main>
    )
  }

  const token = tokenRows[0]
  const jobRows = await db.select().from(jobs).where(eq(jobs.id, token.jobId)).limit(1)
  const job = jobRows[0]

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', padding: '32px 16px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ marginBottom: '28px' }}>
          <img src="/parsco-logo.png" alt="ParsCo" style={{ height: '28px', marginBottom: '16px' }} />
          <div className="section-label">Bid Submission</div>
          <h1 className="serif" style={{ fontSize: '1.6rem', fontWeight: '600', color: 'var(--navy)', margin: 0 }}>
            {job?.name ?? 'Project Bid'}
          </h1>
          {job?.siteAddress && (
            <div className="meta" style={{ marginTop: '4px' }}>{job.siteAddress}</div>
          )}
        </div>
        <BidForm jobId={token.jobId} jobName={job?.name ?? ''} />
      </div>
    </main>
  )
}
