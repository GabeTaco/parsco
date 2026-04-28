'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Submittal {
  id: string
  submittalNumber: string
  specSection: string
  description: string
  submittedBy: string
  reviewedBy: string
  status: string
  revisionNo: number
  reviewerNotes: string
  dueDate: string
  submittedAt: string | null
  reviewedAt: string | null
}

const statusBadge: Record<string, string> = {
  pending: 'badge badge--complete',
  submitted: 'badge badge--active',
  approved: 'badge badge--complete',
  approved_as_noted: 'badge badge--punch',
  revise_resubmit: 'badge badge--punch',
  rejected: 'badge',
}

const statusLabel: Record<string, string> = {
  pending: 'Pending',
  submitted: 'Submitted',
  approved: 'Approved',
  approved_as_noted: 'Approved w/ Notes',
  revise_resubmit: 'Revise & Resubmit',
  rejected: 'Rejected',
}

export default function SubmittalClient({ jobId, initialSubmittals }: { jobId: string; initialSubmittals: Submittal[] }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ submittalNumber: '', specSection: '', description: '', submittedBy: '', dueDate: '' })

  async function submit() {
    setSaving(true)
    await fetch('/api/submittals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, ...form }),
    })
    router.refresh()
    setShowForm(false)
    setForm({ submittalNumber: '', specSection: '', description: '', submittedBy: '', dueDate: '' })
    setSaving(false)
  }

  async function updateStatus(id: string, status: string, reviewerNotes?: string, reviewedBy?: string) {
    await fetch(`/api/submittals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, reviewerNotes, reviewedBy }),
    })
    router.refresh()
  }

  const nextNumber = `S-${String(initialSubmittals.length + 1).padStart(3, '0')}`

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Submittal'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="section-label" style={{ marginBottom: '16px' }}>New Submittal</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Submittal #</label>
              <input className="input" value={form.submittalNumber || nextNumber} onChange={e => setForm({ ...form, submittalNumber: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Spec Section</label>
              <input className="input" value={form.specSection} onChange={e => setForm({ ...form, specSection: e.target.value })} placeholder="e.g. 09200 Drywall" />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Description *</label>
              <input className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What is being submitted for approval?" />
            </div>
            <div className="form-group">
              <label className="form-label">Submitted By</label>
              <input className="input" value={form.submittedBy} onChange={e => setForm({ ...form, submittedBy: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input className="input" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
            </div>
          </div>
          <button className="btn btn-primary" onClick={submit} disabled={saving || !form.description}>
            {saving ? 'Submitting…' : 'Add Submittal'}
          </button>
        </div>
      )}

      {initialSubmittals.length === 0 ? (
        <div className="card muted" style={{ fontSize: '0.85rem' }}>No submittals yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {initialSubmittals.map(sub => (
            <div key={sub.id} className="card" style={{ padding: '0' }}>
              <div
                style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: '12px' }}
                onClick={() => setExpanded(expanded === sub.id ? null : sub.id)}
              >
                <span className="tiny" style={{ fontWeight: 700, color: 'var(--steel)', flexShrink: 0, marginTop: '2px' }}>{sub.submittalNumber}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: '0.9rem', marginBottom: '2px' }}>{sub.description}</div>
                  {sub.specSection && <div className="tiny">{sub.specSection}</div>}
                </div>
                <span className={statusBadge[sub.status] ?? 'badge'} style={{ flexShrink: 0 }}>{statusLabel[sub.status] ?? sub.status}</span>
              </div>
              {expanded === sub.id && (
                <div style={{ padding: '0 18px 16px', borderTop: '1px solid var(--border)' }}>
                  {sub.reviewerNotes && (
                    <div style={{ marginTop: '12px', background: 'var(--bg)', borderRadius: '4px', padding: '10px 12px' }}>
                      <div className="form-label">Reviewer Notes</div>
                      <p style={{ fontSize: '0.88rem', lineHeight: '1.55', margin: 0 }}>{sub.reviewerNotes}</p>
                    </div>
                  )}
                  {(sub.status === 'pending' || sub.status === 'submitted') && (
                    <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button className="btn" style={{ fontSize: '0.75rem' }} onClick={() => updateStatus(sub.id, 'approved')}>Approve</button>
                      <button className="btn" style={{ fontSize: '0.75rem' }} onClick={() => updateStatus(sub.id, 'approved_as_noted')}>Approve w/ Notes</button>
                      <button className="btn" style={{ fontSize: '0.75rem' }} onClick={() => updateStatus(sub.id, 'revise_resubmit')}>Revise & Resubmit</button>
                    </div>
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
