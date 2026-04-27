import { db } from '@/lib/db'
import { tokens, jobs } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Nav from '@/components/Nav'
import TokenForm from './TokenForm'
import LinkActions from './LinkActions'

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function AdminTokensPage() {
  const allJobs = await db.select().from(jobs).orderBy(jobs.name)

  const linkRows = await db
    .select({
      id: tokens.id,
      tokenValue: tokens.tokenValue,
      expiresAt: tokens.expiresAt,
      jobName: jobs.name,
    })
    .from(tokens)
    .leftJoin(jobs, eq(tokens.jobId, jobs.id))
    .orderBy(tokens.createdAt)

  return (
    <>
      <Nav />
      <main className="page page-detail">
        <h1 className="page-title">Site Report Links</h1>
        <p className="muted" style={{ fontSize: '0.85rem', marginBottom: '32px', marginTop: '-16px' }}>
          Send a link to your super so they can submit daily site reports from their phone.
        </p>

        <TokenForm jobs={allJobs.map((j) => ({ id: j.id, name: j.name }))} />

        <div style={{ marginTop: '40px' }}>
          <div className="section-label" style={{ marginBottom: '16px' }}>Active Links</div>
          {linkRows.length === 0 ? (
            <div className="card muted" style={{ fontSize: '0.85rem' }}>No links yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {linkRows.map((link) => (
                <div key={link.id} className="card" style={{ padding: '16px 20px' }}>
                  <div className="row-between">
                    <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>
                      {link.jobName ?? 'Unknown job'}
                    </div>
                    <div className="tiny">Good until {formatDate(link.expiresAt)}</div>
                  </div>
                  <LinkActions tokenId={link.id} tokenValue={link.tokenValue} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
