'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import Link from 'next/link'

export default function NewJobPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    clientName: '',
    siteAddress: '',
    contractValue: '',
    startDate: '',
    targetCompletionDate: '',
    status: 'bidding',
  })

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          contractValue: parseFloat(form.contractValue),
        }),
      })
      const data = await res.json()
      if (res.ok) {
        router.push(`/jobs/${data.id}`)
      } else {
        setError(data.error ?? 'Failed to create job')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const ready = form.name && form.clientName && form.siteAddress && form.contractValue && form.startDate && form.targetCompletionDate

  return (
    <>
      <Nav />
      <main className="page page-detail">
        <div className="row" style={{ marginBottom: '24px' }}>
          <Link href="/jobs" className="btn btn-ghost">← Jobs</Link>
        </div>

        <h1 className="page-title">New Job</h1>

        <form onSubmit={handleSubmit}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            <div className="two-col">
              <div>
                <label className="form-label">Job Name</label>
                <input className="input" required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Beachview Remodel" />
              </div>
              <div>
                <label className="form-label">Client Name</label>
                <input className="input" required value={form.clientName} onChange={(e) => set('clientName', e.target.value)} placeholder="Coastal Properties LLC" />
              </div>
            </div>

            <div>
              <label className="form-label">Site Address</label>
              <input className="input" required value={form.siteAddress} onChange={(e) => set('siteAddress', e.target.value)} placeholder="12 Marina Dr, Pensacola FL 32502" />
            </div>

            <div className="two-col">
              <div>
                <label className="form-label">Contract Value</label>
                <input className="input" type="number" required min="0" step="1000" value={form.contractValue} onChange={(e) => set('contractValue', e.target.value)} placeholder="850000" />
              </div>
              <div>
                <label className="form-label">Status</label>
                <select className="select" value={form.status} onChange={(e) => set('status', e.target.value)}>
                  <option value="bidding">Bidding</option>
                  <option value="active">Active</option>
                  <option value="punch_list">Punch List</option>
                  <option value="complete">Complete</option>
                </select>
              </div>
            </div>

            <div className="two-col">
              <div>
                <label className="form-label">Start Date</label>
                <input className="input" type="date" required value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Target Completion</label>
                <input className="input" type="date" required value={form.targetCompletionDate} onChange={(e) => set('targetCompletionDate', e.target.value)} />
              </div>
            </div>

          </div>

          {error && (
            <p style={{ color: 'var(--flag-red)', fontSize: '0.85rem', marginTop: '12px' }}>{error}</p>
          )}

          <div className="row" style={{ marginTop: '24px', gap: '12px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!ready || loading}
              style={{ opacity: !ready || loading ? 0.5 : 1, cursor: !ready || loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Creating...' : 'Create Job'}
            </button>
            <Link href="/jobs" className="btn">Cancel</Link>
          </div>
        </form>
      </main>
    </>
  )
}
