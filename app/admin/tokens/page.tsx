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
      <main style={{ padding: '32px 24px', maxWidth: '780px', margin: '0 auto' }}>
        <h1
          className="serif"
          style={{ fontSize: '1.6rem', fontWeight: 'normal', marginBottom: '8px', color: '#1a1512' }}
        >
          Report Tokens
        </h1>
        <p style={{ color: '#8a7e74', fontSize: '0.85rem', marginBottom: '32px' }}>
          Generate shareable links for supers to submit daily site reports.
        </p>

        <TokenForm jobs={allJobs.map((j) => ({ id: j.id, name: j.name }))} />

        <div style={{ marginTop: '40px' }}>
          <h2
            style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#8a7e74',
              margin: '0 0 16px',
            }}
          >
            Active Tokens
          </h2>
          {tokenRows.length === 0 ? (
            <p style={{ color: '#8a7e74', fontSize: '0.85rem' }}>No tokens yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {tokenRows.map((t) => (
                <div
                  key={t.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #d8cfc2',
                    borderRadius: '8px',
                    padding: '16px 20px',
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
                      <div style={{ fontWeight: '500', fontSize: '0.9rem', color: '#1a1512', marginBottom: '4px' }}>
                        {t.jobName ?? 'Unknown job'}
                      </div>
                      <div
                        style={{
                          fontSize: '0.78rem',
                          color: '#8a7e74',
                          fontFamily: 'monospace',
                          backgroundColor: '#fbf8f2',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: '1px solid #d8cfc2',
                          marginBottom: '8px',
                        }}
                      >
                        {t.tokenValue}
                      </div>
                      <CopyUrl tokenValue={t.tokenValue} />
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#8a7e74' }}>
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
      <span style={{ fontSize: '0.78rem', color: '#8a7e74' }}>{url}</span>
    </div>
  )
}
