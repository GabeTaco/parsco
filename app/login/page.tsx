'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })
      if (res.ok) {
        router.push('/jobs')
      } else {
        setError('Incorrect PIN')
        setPin('')
      }
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <img src="/parsco-logo.png" alt="ParsCo" style={{ height: '36px', marginBottom: '24px' }} />
        <p className="muted" style={{ marginBottom: '32px', fontSize: '0.9rem' }}>
          Enter PIN to continue
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="••••"
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '1.5rem',
              textAlign: 'center',
              letterSpacing: '0.5em',
              border: '1px solid var(--border)',
              borderRadius: '3px',
              backgroundColor: '#fff',
              color: 'var(--text)',
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: 'var(--sans)',
            }}
            autoFocus
            autoComplete="off"
          />
          {error && (
            <p style={{ color: 'var(--flag-red)', fontSize: '0.85rem', marginTop: '12px' }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={pin.length !== 4 || loading}
            style={{
              marginTop: '20px',
              width: '100%',
              padding: '12px',
              backgroundColor: pin.length === 4 && !loading ? 'var(--navy)' : 'var(--border)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '3px',
              fontSize: '0.78rem',
              fontWeight: '600',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: pin.length === 4 && !loading ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.15s',
              fontFamily: 'var(--sans)',
            }}
          >
            {loading ? 'Checking...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
