import { db } from '@/lib/db'
import { jobs, estimates, estimateItems } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/Nav'
import EstimateClient from './EstimateClient'

export default async function EstimatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const jobRows = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1)
  if (jobRows.length === 0) notFound()
  const job = jobRows[0]

  const estimateRows = await db.select().from(estimates).where(eq(estimates.jobId, id)).limit(1)
  const estimate = estimateRows[0] ?? null

  const items = estimate
    ? await db
        .select()
        .from(estimateItems)
        .where(eq(estimateItems.estimateId, estimate.id))
        .orderBy(asc(estimateItems.csiDivision), asc(estimateItems.sortOrder))
    : []

  const serializedItems = items.map((item) => ({
    id: item.id,
    csiDivision: item.csiDivision,
    itemNumber: item.itemNumber ?? '',
    description: item.description,
    qty: item.qty ?? '0',
    unit: item.unit ?? '',
    laborUnit: item.laborUnit ?? '0',
    laborTotal: item.laborTotal ?? '0',
    materialUnit: item.materialUnit ?? '0',
    materialTotal: item.materialTotal ?? '0',
    subUnit: item.subUnit ?? '0',
    subTotal: item.subTotal ?? '0',
    equipUnit: item.equipUnit ?? '0',
    equipTotal: item.equipTotal ?? '0',
    lineTotal: item.lineTotal ?? '0',
    bic: item.bic ?? '',
    sortOrder: item.sortOrder,
  }))

  return (
    <>
      <Nav />
      <main className="page" style={{ maxWidth: '1400px' }}>
        <div className="row" style={{ marginBottom: '24px' }}>
          <Link href={`/jobs/${id}`} className="btn btn-ghost">← {job.name}</Link>
        </div>
        <EstimateClient
          jobId={id}
          jobName={job.name}
          estimate={estimate ? { id: estimate.id, name: estimate.name } : null}
          initialItems={serializedItems}
        />
      </main>
    </>
  )
}
