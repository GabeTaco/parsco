import { db } from '@/lib/db'
import { jobs, invoices } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/Nav'
import BillingsClient from './BillingsClient'

export default async function BillingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const jobRows = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1)
  if (jobRows.length === 0) notFound()
  const job = jobRows[0]

  const allInvoices = await db
    .select()
    .from(invoices)
    .where(eq(invoices.jobId, id))
    .orderBy(desc(invoices.invoiceDate))

  const totalBilled = allInvoices.reduce((s, i) => s + parseFloat(String(i.amount)), 0)
  const totalPaid = allInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + parseFloat(String(i.amount)), 0)
  const totalPending = allInvoices.filter(i => i.status === 'pending' || i.status === 'approved').reduce((s, i) => s + parseFloat(String(i.amount)), 0)

  return (
    <>
      <Nav />
      <main className="page page-detail">
        <div className="row" style={{ marginBottom: '24px' }}>
          <Link href={`/jobs/${id}`} className="btn btn-ghost">← {job.name}</Link>
        </div>
        <div className="row-between" style={{ marginBottom: '28px' }}>
          <h1 className="page-title" style={{ margin: 0 }}>Billings</h1>
        </div>

        {/* KPI strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '28px' }}>
          {[
            { label: 'Total Invoiced', value: totalBilled },
            { label: 'Paid', value: totalPaid },
            { label: 'Pending', value: totalPending },
          ].map(stat => (
            <div key={stat.label} className="card" style={{ textAlign: 'center', padding: '16px' }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--navy)' }}>
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(stat.value)}
              </div>
              <div className="tiny" style={{ marginTop: '4px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <BillingsClient jobId={id} initialInvoices={allInvoices.map(inv => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber ?? '',
          vendor: inv.vendor,
          description: inv.description ?? '',
          csiDivision: inv.csiDivision,
          amount: String(inv.amount),
          invoiceDate: inv.invoiceDate,
          dueDate: inv.dueDate ?? '',
          paidDate: inv.paidDate ?? '',
          status: inv.status,
          notes: inv.notes ?? '',
        }))} />
      </main>
    </>
  )
}
