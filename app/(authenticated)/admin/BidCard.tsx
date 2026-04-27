'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Bid {
  id: string
  subcontractorName: string
  trade: string
  totalAmount: string
  status: string
  bidDate: string
  submittedAt: string
  reviewNotes: string | null
}

interface LineItem {
  id: string
  sortOrder: number
  description: string
  quantity: string | null
  unit: string | null
  unitPrice: string | null
  totalPrice: string
  notes: string | null
}

const STATUS_OPTIONS = ['submitted', 'reviewed', 'awarded', 'rejected']

const statusStyle: Record<string, React.CSSProperties> = {
  draft:     { background: '#e8eaee', color: '#4a5366' },
  submitted: { background: '#e3eef5', color: '#1f5288' },
  reviewed:  { background: '#fff3d9', color: '#8a5a00' },
  awarded:   { background: '#e3f0e8', color: '#2e7d4f' },
  rejected:  { background: '#fde8e8', color: '#8a1f1f' },
}

function fmt(n: string | null) {
  if (!n) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(parseFloat(n))
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function BidCard({ bid }: { bid: Bid }) {
  const [expanded, setExpanded] = useState(false)
  const [lineItems, setLineItems] = useState<LineItem[] | null>(null)
  const [status, setStatus] = useState(bid.status)
  const [reviewNotes, setReviewNotes] = useState(bid.reviewNotes ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  async function expand() {
    if (!expanded && !lineItems) {
      const res = await fetch(`/api/bids/${bid.id}`)
      const data = await res.json()
      setLineItems(data.lineItems ?? [])
    }
    setExpanded((v) => !v)
  }

  async function save() {
    setSaving(true)
    await fetch(`/api/bids/${bid.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, reviewNotes }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  const st = statusStyle[status] ?? statusStyle.submitted

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: '4px', background: '#fff', marginTop: '8px' }}>
      {/* Collapsed row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>{bid.subcontractorName}</span>
          <span className="tiny">·</span>
          <span className="tiny">{bid.trade}</span>
          <span className="tiny">·</span>
          <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: '600', color: 'var(--navy)', fontSize: '1.05rem' }}>{fmt(bid.totalAmount)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="badge" style={st}>{status}</span>
          <span className="tiny">{fmtDate(bid.submittedAt)}</span>
          <button className="btn" style={{ fontSize: '0.72rem', padding: '4px 10px' }} onClick={expand}>
            {expanded ? 'Close' : 'Review'}
          </button>
        </div>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '16px' }}>
          {/* Line items */}
          {lineItems === null ? (
            <p className="muted" style={{ fontSize: '0.85rem' }}>Loading...</p>
          ) : lineItems.length === 0 ? (
            <p className="muted" style={{ fontSize: '0.85rem' }}>No line items submitted.</p>
          ) : (
            <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Description', 'Qty', 'Unit', 'Unit Price', 'Total'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '6px 10px', color: 'var(--muted)', fontWeight: '600', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((li) => (
                    <tr key={li.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '8px 10px' }}>{li.description}</td>
                      <td style={{ padding: '8px 10px' }}>{li.quantity ?? '—'}</td>
                      <td style={{ padding: '8px 10px' }}>{li.unit ?? '—'}</td>
                      <td style={{ padding: '8px 10px' }}>{li.unitPrice ? fmt(li.unitPrice) : '—'}</td>
                      <td style={{ padding: '8px 10px', fontWeight: '500' }}>{fmt(li.totalPrice)}</td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: '2px solid var(--border)' }}>
                    <td colSpan={4} style={{ padding: '8px 10px', fontWeight: '600', textAlign: 'right', color: 'var(--navy)' }}>Bid Total</td>
                    <td style={{ padding: '8px 10px', fontWeight: '600', color: 'var(--navy)' }}>{fmt(bid.totalAmount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Status + notes */}
          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '16px', alignItems: 'start' }}>
            <div>
              <label className="form-label">Status</label>
              <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Review Notes</label>
              <textarea
                className="textarea"
                style={{ minHeight: '70px' }}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Internal notes for Amir..."
              />
            </div>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="btn btn-primary" onClick={save} disabled={saving} style={{ fontSize: '0.75rem', padding: '6px 14px' }}>
              {saving ? 'Saving...' : saved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
