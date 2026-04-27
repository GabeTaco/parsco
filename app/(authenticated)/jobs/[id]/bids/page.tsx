import { db } from '@/lib/db'
import { jobs, bids } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/Nav'
import BidCard from '@/app/(authenticated)/admin/BidCard'

function formatCurrency(v: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(parseFloat(v))
}

export default async function JobBidsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const jobRows = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1)
  if (jobRows.length === 0) notFound()
  const job = jobRows[0]

  const allBids = await db
    .select()
    .from(bids)
    .where(eq(bids.jobId, id))
    .orderBy(desc(bids.submittedAt))

  const totalAwarded = allBids
    .filter((b) => b.status === 'awarded')
    .reduce((sum, b) => sum + parseFloat(String(b.totalAmount)), 0)

  return (
    <>
      <Nav />
      <main className="page page-detail">
        <div className="row" style={{ marginBottom: '24px' }}>
          <Link href={`/jobs/${id}`} className="btn btn-ghost">← {job.name}</Link>
        </div>

        <div className="row-between" style={{ marginBottom: '8px' }}>
          <h1 className="page-title" style={{ margin: 0 }}>Bids</h1>
          {totalAwarded > 0 && (
            <div className="tiny">{formatCurrency(String(totalAwarded))} awarded</div>
          )}
        </div>
        <p className="muted" style={{ fontSize: '0.85rem', marginBottom: '32px' }}>
          {allBids.length} bid{allBids.length !== 1 ? 's' : ''} received · {job.name}
        </p>

        {allBids.length === 0 ? (
          <div className="card muted" style={{ fontSize: '0.85rem' }}>
            No bids received yet. Create a bid link in{' '}
            <Link href="/admin?tab=bids" style={{ color: 'var(--navy)' }}>Admin → Bids</Link>.
          </div>
        ) : (
          <div>
            {allBids.map((b) => (
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
            ))}
          </div>
        )}
      </main>
    </>
  )
}
