import { db } from '@/lib/db'
import { jobs, submittals } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/Nav'
import SubmittalClient from './SubmittalClient'

export default async function SubmittalsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const jobRows = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1)
  if (jobRows.length === 0) notFound()
  const job = jobRows[0]

  const allSubmittals = await db.select().from(submittals).where(eq(submittals.jobId, id)).orderBy(desc(submittals.createdAt))

  return (
    <>
      <Nav />
      <main className="page page-detail">
        <div className="row" style={{ marginBottom: '24px' }}>
          <Link href={`/jobs/${id}`} className="btn btn-ghost">← {job.name}</Link>
        </div>
        <div className="row-between" style={{ marginBottom: '28px' }}>
          <h1 className="page-title" style={{ margin: 0 }}>Submittals</h1>
          <span className="tiny">{allSubmittals.filter(s => s.status === 'pending' || s.status === 'submitted').length} pending review</span>
        </div>
        <SubmittalClient jobId={id} initialSubmittals={allSubmittals.map(s => ({
          id: s.id,
          submittalNumber: s.submittalNumber,
          specSection: s.specSection ?? '',
          description: s.description,
          submittedBy: s.submittedBy ?? '',
          reviewedBy: s.reviewedBy ?? '',
          status: s.status,
          revisionNo: s.revisionNo,
          reviewerNotes: s.reviewerNotes ?? '',
          dueDate: s.dueDate ?? '',
          submittedAt: s.submittedAt?.toISOString() ?? null,
          reviewedAt: s.reviewedAt?.toISOString() ?? null,
        }))} />
      </main>
    </>
  )
}
