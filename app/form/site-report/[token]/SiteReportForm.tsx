'use client'

import { useState } from 'react'

interface Props {
  tokenValue: string
  jobName: string
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  border: '1px solid #d8dde5',
  borderRadius: '3px',
  backgroundColor: '#ffffff',
  color: '#1c2638',
  fontSize: '1rem',
  boxSizing: 'border-box',
  lineHeight: '1.5',
  fontFamily: 'Inter, system-ui, sans-serif',
  appearance: 'none',
  WebkitAppearance: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.72rem',
  fontWeight: '600',
  color: '#6b7689',
  marginBottom: '8px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontFamily: 'Inter, system-ui, sans-serif',
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
        body: JSON.stringify({ tokenValue, superName, reportDate, workCompleted, blockers: blockers || null }),
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
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #d8dde5', borderRadius: '4px', padding: '40px 28px', textAlign: 'center' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#e3eef5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.2rem', color: '#1f5288' }}>
          &#10003;
        </div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.3rem', fontWeight: '600', color: '#2c3e6b', marginBottom: '10px' }}>
          Report submitted
        </h2>
        <p style={{ color: '#6b7689', fontSize: '0.9rem', lineHeight: '1.6' }}>
          Thanks. Your report has been delivered to Amir.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #d8dde5', borderRadius: '4px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={labelStyle}>Your Name</label>
          <input type="text" value={superName} onChange={(e) => setSuperName(e.target.value)} required placeholder="First and last name" style={inputStyle} autoComplete="name" />
        </div>
        <div>
          <label style={labelStyle}>Report Date</label>
          <input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>What got done today</label>
          <textarea value={workCompleted} onChange={(e) => setWorkCompleted(e.target.value)} required rows={5} placeholder="Describe work completed on site today..." style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' }} />
        </div>
        <div>
          <label style={labelStyle}>
            Blockers{' '}
            <span style={{ fontWeight: '400', textTransform: 'none', letterSpacing: 0, color: '#6b7689' }}>(optional)</span>
          </label>
          <textarea value={blockers} onChange={(e) => setBlockers(e.target.value)} rows={3} placeholder="Any issues holding up work..." style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }} />
        </div>
      </div>

      {error && (
        <p style={{ color: '#c0392b', fontSize: '0.85rem', margin: 0 }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !superName || !workCompleted}
        style={{
          padding: '16px',
          backgroundColor: loading || !superName || !workCompleted ? '#d8dde5' : '#2c3e6b',
          color: '#ffffff',
          border: 'none',
          borderRadius: '3px',
          fontSize: '0.78rem',
          fontWeight: '600',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          cursor: loading || !superName || !workCompleted ? 'not-allowed' : 'pointer',
          width: '100%',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {loading ? 'Submitting...' : 'Submit Report'}
      </button>

      <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#6b7689', fontFamily: 'Inter, system-ui, sans-serif' }}>
        {jobName}
      </p>
    </form>
  )
}
