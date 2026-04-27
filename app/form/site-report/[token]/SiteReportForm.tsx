'use client'

import { useState } from 'react'

interface Props {
  tokenValue: string
  jobName: string
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  border: '1px solid #d8cfc2',
  borderRadius: '8px',
  backgroundColor: '#ffffff',
  color: '#1a1512',
  fontSize: '1rem',
  boxSizing: 'border-box',
  lineHeight: '1.5',
  appearance: 'none',
  WebkitAppearance: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.82rem',
  fontWeight: '500',
  color: '#8a7e74',
  marginBottom: '8px',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
}

export default function SiteReportForm({ tokenValue, jobName }: Props) {
  const today = new Date().toISOString().slice(0, 10)
  const [superName, setSuperName] = useState('')
  const [reportDate, setReportDate] = useState(today)
  const [workCompleted, setWorkCompleted] = useState('')
  const [blockers, setBlockers] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/site-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenValue,
          superName,
          reportDate,
          workCompleted,
          blockers: blockers || null,
        }),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        const data = await res.json()
        setError(data.error ?? 'Submission failed. Try again.')
      }
    } catch {
      setError('Network error. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #d8cfc2',
          borderRadius: '8px',
          padding: '40px 28px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: '#e8f5e9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '1.2rem',
          }}
        >
          &#10003;
        </div>
        <h2
          className="serif"
          style={{ fontSize: '1.2rem', fontWeight: 'normal', color: '#1a1512', marginBottom: '10px' }}
        >
          Report submitted
        </h2>
        <p style={{ color: '#8a7e74', fontSize: '0.9rem', lineHeight: '1.6' }}>
          Thanks. Your report has been delivered to Amir.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #d8cfc2',
          borderRadius: '8px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <div>
          <label style={labelStyle}>Your Name</label>
          <input
            type="text"
            value={superName}
            onChange={(e) => setSuperName(e.target.value)}
            required
            placeholder="First and last name"
            style={inputStyle}
            autoComplete="name"
          />
        </div>

        <div>
          <label style={labelStyle}>Report Date</label>
          <input
            type="date"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>What got done today</label>
          <textarea
            value={workCompleted}
            onChange={(e) => setWorkCompleted(e.target.value)}
            required
            rows={5}
            placeholder="Describe work completed on site today..."
            style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' }}
          />
        </div>

        <div>
          <label style={labelStyle}>
            Blockers{' '}
            <span style={{ fontWeight: '400', textTransform: 'none', letterSpacing: 0, color: '#8a7e74' }}>
              (optional)
            </span>
          </label>
          <textarea
            value={blockers}
            onChange={(e) => setBlockers(e.target.value)}
            rows={3}
            placeholder="Any issues holding up work..."
            style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
          />
        </div>
      </div>

      {error && (
        <p style={{ color: '#6b1f1a', fontSize: '0.85rem', margin: 0 }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !superName || !workCompleted}
        style={{
          padding: '16px',
          backgroundColor: loading || !superName || !workCompleted ? '#d8cfc2' : '#6b1f1a',
          color: '#ffffff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: '500',
          cursor: loading || !superName || !workCompleted ? 'not-allowed' : 'pointer',
          width: '100%',
        }}
      >
        {loading ? 'Submitting...' : 'Submit Report'}
      </button>

      <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#8a7e74' }}>
        {jobName}
      </p>
    </form>
  )
}
