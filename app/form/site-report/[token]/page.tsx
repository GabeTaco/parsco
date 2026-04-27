import { db } from '@/lib/db'
import { tokens, jobs } from '@/lib/db/schema'
import { and, eq, gt } from 'drizzle-orm'
import SiteReportForm from './SiteReportForm'

export default async function SiteReportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token: tokenValue } = await params

  const now = new Date()
  const tokenRows = await db
    .select()
    .from(tokens)
    .where(and(eq(tokens.tokenValue, tokenValue), gt(tokens.expiresAt, now)))
    .limit(1)

  if (tokenRows.length === 0) {
    return (
      <main className="login-shell" style={{ padding: '24px' }}>
        <div className="card" style={{ maxWidth: '400px', textAlign: 'center', padding: '40px 32px', borderRadius: '8px' }}>
          <h1
            className="serif"
            style={{ fontSize: '1.2rem', fontWeight: 'normal', marginBottom: '12px' }}
          >
            Link Expired
          </h1>
          <p className="muted" style={{ fontSize: '0.9rem' }}>
            This report link is no longer valid. Contact your project manager for a new link.
          </p>
        </div>
      </main>
    )
  }

  const token = tokenRows[0]
  const jobRows = await db.select().from(jobs).where(eq(jobs.id, token.jobId)).limit(1)
  const job = jobRows[0]

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg)',
        padding: '32px 16px',
      }}
    >
      <div style={{ maxWidth: '520px', margin: '0 auto' }}>
        <div style={{ marginBottom: '28px' }}>
          <p
            className="serif muted"
            style={{ fontSize: '1rem', marginBottom: '4px', fontStyle: 'italic' }}
          >
            Parsco GC
          </p>
          <h1
            className="serif"
            style={{ fontSize: '1.4rem', fontWeight: 'normal', margin: 0 }}
          >
            {job?.name ?? 'Site Report'}
          </h1>
        </div>

        <SiteReportForm tokenValue={tokenValue} jobName={job?.name ?? ''} />
      </div>
    </main>
  )
}
