'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  tokenId: string
  tokenValue: string
}

export default function LinkActions({ tokenId, tokenValue }: Props) {
  const [copied, setCopied] = useState(false)
  const [showQr, setShowQr] = useState(false)
  const [revoking, setRevoking] = useState(false)
  const router = useRouter()

  const path = `/form/site-report/${tokenValue}`

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}${path}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function revoke() {
    if (!window.confirm('Revoke this link? Anyone using it won\'t be able to submit reports.')) return
    setRevoking(true)
    await fetch(`/api/tokens/${tokenId}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div>
      <div className="row" style={{ gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
        <button
          className="btn btn-primary"
          onClick={copyLink}
          style={{ fontSize: '0.75rem', padding: '6px 14px' }}
        >
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
        <button
          className="btn"
          onClick={() => setShowQr((v) => !v)}
          style={{ fontSize: '0.75rem', padding: '6px 14px' }}
        >
          {showQr ? 'Hide QR' : 'Show QR'}
        </button>
        <button
          className="btn"
          onClick={revoke}
          disabled={revoking}
          style={{ fontSize: '0.75rem', padding: '6px 14px', color: 'var(--flag-red)', borderColor: 'var(--flag-red)' }}
        >
          {revoking ? 'Revoking...' : 'Revoke'}
        </button>
      </div>
      {showQr && (
        <div style={{ marginTop: '14px' }}>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}${path}`)}`}
            alt="QR code for site report link"
            width={120}
            height={120}
            style={{ display: 'block', border: '1px solid var(--border)', borderRadius: '3px', padding: '6px', background: '#fff' }}
          />
          <p className="tiny" style={{ marginTop: '6px' }}>Print or screenshot — scan opens the report form.</p>
        </div>
      )}
    </div>
  )
}
