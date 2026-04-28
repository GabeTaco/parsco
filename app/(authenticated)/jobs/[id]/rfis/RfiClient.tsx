'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Rfi {
  id: string
  rfiNumber: number
  subject: string
  question: string
  drawingRef: string
  sentTo: string
  submittedBy: string
  status: string
  answer: string
  answeredBy: string
  dueDate: string
  submittedAt: string
  answeredAt: string | null
}

const statusBadge: Record<string, string> = {
  open: 'badge badge--active',
  answered: 'badge badge--bidding',
  closed: 'badge badge--complete',
}

export default function RfiClient({ jobId, initialRfis }: { jobId: string; initialRfis: Rfi[] }) {
  const router = useRouter()
  const [rfis, setRfis] = useState(initialRfis)
  const [showForm, setShowForm] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ subject: '', question: '', drawingRef: '', sentTo: '', dueDate: '' })

  async function submitRfi() {
    setSaving(true)
    const res = await fetch('/api/rfis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, ...form }),
    })
    if (res.ok) { router.refresh(); setShowForm(false); setForm({ subject: '', question: '', drawingRef: '', sentTo: '', dueDate: '' }) }
    setSaving(false)
  }

  async function updateStatus(id: string, status: string, answer?: string, answeredBy?: string) {
    await fetch(`/api/rfis/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, answer, answeredBy }),
    })
    router.refresh()
  }

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New RFI'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="section-label" style={{ marginBottom: '16px' }}>New RFI</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Subject *</label>
              <input className="input" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Brief subject line" />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Question *</label>
              <textarea className="textarea" value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} placeholder="Detailed question or request for information…" style={{ minHeight: '80px' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Drawing / Spec Reference</label>
              <input className="input" value={form.drawingRef} onChange={e => setForm({ ...form, drawingRef: e.target.value })} placeholder="e.g. Sheet A-7, Spec 09200" />
            </div>
            <div className="form-group">
              <label className="form-label">Send To</label>
              <input className="input" value={form.sentTo} onChange={e => setForm({ ...form, sentTo: e.target.value })} placeholder="Architect, engineer, owner…" />
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input className="input" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
            </div>
          </div>
          <button className="btn btn-primary" onClick={submitRfi} disabled={saving || !form.subject || !form.question}>
            {saving ? 'Submitting…' : 'Submit RFI'}
          </button>
        </div>
      )}

      {rfis.length === 0 ? (
        <div className="card muted" style={{ fontSize: '0.85rem' }}>No RFIs yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {rfis.map(rfi => (
            <div key={rfi.id} className="card" style={{ padding: '0' }}>
              <div
                style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: '12px' }}
                onClick={() => setExpanded(expanded === rfi.id ? null : rfi.id)}
              >
                <span className="tiny" style={{ fontWeight: 700, color: 'var(--steel)', flexShrink: 0, marginTop: '2px' }}>RFI-{String(rfi.rfiNumber).padStart(3, '0')}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: '0.9rem', marginBottom: '2px' }}>{rfi.subject}</div>
                  {rfi.sentTo && <div className="tiny">{rfi.sentTo}</div>}
                </div>
                <span className={statusBadge[rfi.status] ?? 'badge'}>{rfi.status}</span>
              </div>
              {expanded === rfi.id && (
                <div style={{ padding: '0 18px 16px', borderTop: '1px solid var(--border)' }}>
                  <div className="form-group" style={{ marginTop: '14px' }}>
                    <div className="form-label">Question</div>
                    <p style={{ fontSize: '0.88rem', lineHeight: '1.55', margin: 0 }}>{rfi.question}</p>
                  </div>
                  {rfi.drawingRef && <div className="tiny" style={{ marginTop: '8px' }}>Ref: {rfi.drawingRef}</div>}
                  {rfi.answer && (
                    <div style={{ marginTop: '12px', background: 'var(--bg)', borderRadius: '4px', padding: '10px 12px' }}>
                      <div className="form-label">Answer</div>
                      <p style={{ fontSize: '0.88rem', lineHeight: '1.55', margin: 0 }}>{rfi.answer}</p>
                      {rfi.answeredBy && <div className="tiny" style={{ marginTop: '4px' }}>— {rfi.answeredBy}</div>}
                    </div>
                  )}
                  {rfi.status === 'open' && (
                    <button className="btn" style={{ marginTop: '12px', fontSize: '0.75rem' }} onClick={() => updateStatus(rfi.id, 'closed')}>
                      Mark Closed
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
