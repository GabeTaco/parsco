import { db } from '@/lib/db'
import { tokens, jobs } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Nav from '@/components/Nav'
import TokenForm from './TokenForm'

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default async function AdminTokensPage() {
  const allJobs = await db.select().from(jobs).orderBy(jobs.name)

  const tokenRows = await db
    .select({
      id: tokens.id,
      tokenValue: tokens.tokenValue,
      purpose: tokens.purpose,
      expiresAt: tokens.expiresAt,
      createdAt: tokens.createdAt,
      jobId: tokens.jobId,
      jobName: jobs.name,
    })
    .from(tokens)
    .leftJoin(jobs, eq(tokens.jobId, jobs.id))
    .orderBy(tokens.createdAt)

  return (
    <>
      <Nav />
      <main className="page-shell--narrow">
        <h1 className="serif page-title" style={{ marginBottom: '8px' }}>
          Report Tokens
        </h1>
        <p className="muted" style={{ fontSize: '0.85rem', marginBottom: '32px' }}>
          Generate shareable links for supers to submit daily site reports.
        </p>

        <TokenForm jobs={allJobs.map((j) => ({ id: j.id, name: j.name }))} />

        <div style={{ marginTop: '40px' }}>
          <h2 className="section-label" style={{ margin: '0 0 16px' }}>
            Active Tokens
          </h2>
          {tokenRows.length === 0 ? (
            <p className="muted" style={{ fontSize: '0.85rem' }}>No tokens yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {tokenRows.map((t) => (
                <div key={t.id} className="card" style={{ padding: '16px 20px' }}>
                  <div className="row--top">
                    <div>
                      <div style={{ fontWeight: '500', fontSize: '0.9rem', marginBottom: '4px' }}>
                        {t.jobName ?? 'Unknown job'}
                      </div>
                      <div
                        style={{
                          fontSize: '0.78rem',
                          color: 'var(--muted)',
                          fontFamily: 'monospace',
                          backgroundColor: 'var(--bg)',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: '1px solid var(--border)',
                          marginBottom: '8px',
                        }}
                      >
                        {t.tokenValue}
                      </div>
                      <CopyUrl tokenValue={t.tokenValue} />
                    </div>
                    <div className="muted" style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                      <div>Expires {formatDate(t.expiresAt)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}

function CopyUrl({ tokenValue }: { tokenValue: string }) {
  const url = `/form/site-report/${tokenValue}`
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span className="muted" style={{ fontSize: '0.78rem' }}>{url}</span>
    </div>
  )
}
