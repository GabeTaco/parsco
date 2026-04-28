'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Invoice {
  id: string
  invoiceNumber: string
  vendor: string
  description: string
  csiDivision: number | null
  amount: string
  invoiceDate: string
  dueDate: string
  paidDate: string
  status: string
  notes: string
}

const statusBadge: Record<string, string> = {
  pending: 'badge badge--punch',
  approved: 'badge badge--active',
  paid: 'badge badge--complete',
  disputed: 'badge',
}

const $ = (v: string | number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(parseFloat(String(v)))

function fmtDate(d: string) {
  if (!d) return '—'
  const [y, m, day] = d.split('-').map(Number)
  return new Date(y, m - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function BillingsClient({ jobId, initialInvoices }: { jobId: string; initialInvoices: Invoice[] }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ invoiceNumber: '', vendor: '', description: '', amount: '', invoiceDate: '', dueDate: '', csiDivision: '' })

  async function submit() {
    setSaving(true)
    await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, ...form, csiDivision: form.csiDivision ? Number(form.csiDivision) : null }),
    })
    router.refresh()
    setShowForm(false)
    setForm({ invoiceNumber: '', vendor: '', description: '', amount: '', invoiceDate: '', dueDate: '', csiDivision: '' })
    setSaving(false)
  }

  async function markPaid(id: string) {
    await fetch(`/api/invoices/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'paid', paidDate: new Date().toISOString().split('T')[0] }),
    })
    router.refresh()
  }

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Invoice'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="section-label" style={{ marginBottom: '16px' }}>New Invoice</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Invoice #</label>
              <input className="input" value={form.invoiceNumber} onChange={e => setForm({ ...form, invoiceNumber: e.target.value })} placeholder="e.g. INV-001" />
            </div>
            <div className="form-group">
              <label className="form-label">Vendor *</label>
              <input className="input" value={form.vendor} onChange={e => setForm({ ...form, vendor: e.target.value })} placeholder="Subcontractor or vendor name" />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Description</label>
              <input className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Scope or invoice description" />
            </div>
            <div className="form-group">
              <label className="form-label">Amount *</label>
              <input className="input" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0" />
            </div>
            <div className="form-group">
              <label className="form-label">CSI Division</label>
              <select className="select" value={form.csiDivision} onChange={e => setForm({ ...form, csiDivision: e.target.value })}>
                <option value="">Select…</option>
                {Array.from({ length: 16 }, (_, i) => i + 1).map(d => <option key={d} value={d}>Division {d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Invoice Date *</label>
              <input className="input" type="date" value={form.invoiceDate} onChange={e => setForm({ ...form, invoiceDate: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input className="input" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
            </div>
          </div>
          <button className="btn btn-primary" onClick={submit} disabled={saving || !form.vendor || !form.amount || !form.invoiceDate}>
            {saving ? 'Saving…' : 'Add Invoice'}
          </button>
        </div>
      )}

      {initialInvoices.length === 0 ? (
        <div className="card muted" style={{ fontSize: '0.85rem' }}>No invoices yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {initialInvoices.map(inv => (
            <div key={inv.id} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: '0.9rem', marginBottom: '2px' }}>
                  {inv.vendor}{inv.invoiceNumber ? ` · ${inv.invoiceNumber}` : ''}
                </div>
                {inv.description && <div className="tiny">{inv.description}</div>}
                <div className="tiny" style={{ marginTop: '2px' }}>{fmtDate(inv.invoiceDate)}{inv.dueDate ? ` · Due ${fmtDate(inv.dueDate)}` : ''}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: '1rem', color: 'var(--navy)' }}>{$(inv.amount)}</div>
              </div>
              <span className={statusBadge[inv.status] ?? 'badge'} style={{ flexShrink: 0 }}>{inv.status}</span>
              {inv.status === 'pending' || inv.status === 'approved' ? (
                <button className="btn" style={{ fontSize: '0.72rem', padding: '4px 10px', flexShrink: 0 }} onClick={() => markPaid(inv.id)}>
                  Mark Paid
                </button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
