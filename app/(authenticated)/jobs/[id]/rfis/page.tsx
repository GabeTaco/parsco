import { db } from '@/lib/db'
import { jobs, rfis } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/Nav'
import RfiClient from './RfiClient'

export default async function RfisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const jobRows = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1)
  if (jobRows.length === 0) notFound()
  const job = jobRows[0]

  const allRfis = await db.select().from(rfis).where(eq(rfis.jobId, id)).orderBy(desc(rfis.rfiNumber))

  return (
    <>
      <Nav />
      <main className="page page-detail">
        <div className="row" style={{ marginBottom: '24px' }}>
          <Link href={`/jobs/${id}`} className="btn btn-ghost">← {job.name}</Link>
        </div>
        <div className="row-between" style={{ marginBottom: '28px' }}>
          <h1 className="page-title" style={{ margin: 0 }}>RFI Log</h1>
          <span className="tiny">{allRfis.filter(r => r.status === 'open').length} open</span>
        </div>
        <RfiClient jobId={id} initialRfis={allRfis.map(r => ({
          id: r.id,
          rfiNumber: r.rfiNumber,
          subject: r.subject,
          question: r.question,
          drawingRef: r.drawingRef ?? '',
          sentTo: r.sentTo ?? '',
          submittedBy: r.submittedBy ?? '',
          status: r.status,
          answer: r.answer ?? '',
          answeredBy: r.answeredBy ?? '',
          dueDate: r.dueDate ?? '',
          submittedAt: r.submittedAt.toISOString(),
          answeredAt: r.answeredAt?.toISOString() ?? null,
        }))} />
      </main>
    </>
  )
}
