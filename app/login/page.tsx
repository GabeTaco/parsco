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
        <h1 className="serif" style={{ fontSize: '2rem', fontWeight: 'normal', marginBottom: '8px' }}>
          Parsco
        </h1>
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
              borderRadius: '6px',
              backgroundColor: 'var(--bg)',
              color: 'var(--text)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            autoFocus
            autoComplete="off"
          />
          {error && (
            <p style={{ color: 'var(--accent)', fontSize: '0.85rem', marginTop: '12px' }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={pin.length !== 4 || loading}
            style={{
              marginTop: '20px',
              width: '100%',
              padding: '12px',
              backgroundColor: pin.length === 4 && !loading ? 'var(--accent)' : 'var(--border)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: pin.length === 4 && !loading ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.15s',
            }}
          >
            {loading ? 'Checking...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
