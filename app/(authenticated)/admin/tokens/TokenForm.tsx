'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Job {
  id: string
  name: string
}

export default function TokenForm({ jobs }: { jobs: Job[] }) {
  const [jobId, setJobId] = useState(jobs[0]?.id ?? '')
  const [expiresAt, setExpiresAt] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 90)
    return d.toISOString().slice(0, 10)
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, expiresAt }),
      })
      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error ?? 'Failed to create link')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="section-label" style={{ marginBottom: '20px' }}>New Link</div>
      <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label className="form-label">Job</label>
          <select
            className="select"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>{j.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">Good until</label>
          <input
            type="date"
            className="input"
            style={{ width: 'auto' }}
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </div>
        {error && (
          <p style={{ color: 'var(--flag-red)', fontSize: '0.82rem', margin: 0 }}>{error}</p>
        )}
        <div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !jobId}
            style={{ opacity: loading || !jobId ? 0.5 : 1, cursor: loading || !jobId ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Creating...' : 'Create Link'}
          </button>
        </div>
      </form>
    </div>
  )
}
