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
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fbf8f2',
          padding: '24px',
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #d8cfc2',
            borderRadius: '8px',
            padding: '40px 32px',
            maxWidth: '400px',
            textAlign: 'center',
          }}
        >
          <h1
            className="serif"
            style={{ fontSize: '1.2rem', fontWeight: 'normal', color: '#1a1512', marginBottom: '12px' }}
          >
            Link Expired
          </h1>
          <p style={{ color: '#8a7e74', fontSize: '0.9rem' }}>
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
        backgroundColor: '#fbf8f2',
        padding: '32px 16px',
      }}
    >
      <div
        style={{
          maxWidth: '520px',
          margin: '0 auto',
        }}
      >
        <div style={{ marginBottom: '28px' }}>
          <p
            className="serif"
            style={{ fontSize: '1rem', color: '#8a7e74', marginBottom: '4px', fontStyle: 'italic' }}
          >
            Parsco GC
          </p>
          <h1
            className="serif"
            style={{ fontSize: '1.4rem', fontWeight: 'normal', color: '#1a1512', margin: 0 }}
          >
            {job?.name ?? 'Site Report'}
          </h1>
        </div>

        <SiteReportForm tokenValue={tokenValue} jobName={job?.name ?? ''} />
      </div>
    </main>
  )
}
