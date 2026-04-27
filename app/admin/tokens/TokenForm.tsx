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

  async function handleGenerate(e: React.FormEvent) {
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
        setError(data.error ?? 'Failed to generate token')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #d8cfc2',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '8px',
      }}
    >
      <h2
        style={{
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#8a7e74',
          margin: '0 0 20px',
        }}
      >
        Generate Token
      </h2>
      <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', color: '#8a7e74', marginBottom: '6px' }}>
            Job
          </label>
          <select
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d8cfc2',
              borderRadius: '6px',
              backgroundColor: '#fbf8f2',
              color: '#1a1512',
              fontSize: '0.9rem',
            }}
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', color: '#8a7e74', marginBottom: '6px' }}>
            Expiration Date
          </label>
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            style={{
              padding: '10px 12px',
              border: '1px solid #d8cfc2',
              borderRadius: '6px',
              backgroundColor: '#fbf8f2',
              color: '#1a1512',
              fontSize: '0.9rem',
            }}
          />
        </div>
        {error && (
          <p style={{ color: '#6b1f1a', fontSize: '0.82rem', margin: 0 }}>{error}</p>
        )}
        <button
          type="submit"
          disabled={loading || !jobId}
          style={{
            alignSelf: 'flex-start',
            padding: '10px 24px',
            backgroundColor: loading || !jobId ? '#d8cfc2' : '#6b1f1a',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.88rem',
            fontWeight: '500',
            cursor: loading || !jobId ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Generating...' : 'Generate Token'}
        </button>
      </form>
    </div>
  )
}
