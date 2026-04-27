'use client'

import { useState } from 'react'

export default function DigestGenerator() {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [digest, setDigest] = useState<string | null>(null)
  const [generatedAt, setGeneratedAt] = useState<string | null>(null)

  async function generate() {
    setState('loading')
    try {
      const res = await fetch('/api/digest', { method: 'POST' })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setDigest(data.digest)
      setGeneratedAt(
        new Date(data.generatedAt).toLocaleString('en-US', {
          month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
        })
      )
      setState('done')
    } catch {
      setState('error')
    }
  }

  if (state === 'idle') {
    return (
      <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
        <p className="muted" style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
          AI briefing is generated on demand.
        </p>
        <button className="btn-primary" style={{ width: 'auto', padding: '10px 28px' }} onClick={generate}>
          Generate Digest
        </button>
      </div>
    )
  }

  if (state === 'loading') {
    return (
      <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
        <p className="muted" style={{ fontSize: '0.9rem' }}>Generating briefing...</p>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--accent)', marginBottom: '12px' }}>
          Generation failed. Check that ANTHROPIC_API_KEY is set in Vercel.
        </p>
        <button className="btn-secondary" onClick={generate}>Try again</button>
      </div>
    )
  }

  return (
    <div>
      <div className="card" style={{ padding: '24px', fontSize: '0.9rem', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
        {digest}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
        <span className="muted" style={{ fontSize: '0.75rem' }}>Generated {generatedAt}</span>
        <button className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={generate}>
          Regenerate
        </button>
      </div>
    </div>
  )
}
