'use client'

import { useState } from 'react'

interface Props {
  jobId: string
  jobName: string
}

interface LineItem {
  localId: string
  description: string
  quantity: string
  unit: string
  unitPrice: string
  totalPrice: string
}

const UNITS = ['SF', 'LF', 'EA', 'LS', 'HR', 'Other']

function newLine(): LineItem {
  return { localId: Math.random().toString(36).slice(2), description: '', quantity: '', unit: 'LS', unitPrice: '', totalPrice: '' }
}

function calcTotal(qty: string, price: string): string {
  const q = parseFloat(qty)
  const p = parseFloat(price)
  if (!isNaN(q) && !isNaN(p)) return (q * p).toFixed(2)
  return ''
}

const inputSt: React.CSSProperties = {
  width: '100%', padding: '10px 12px', border: '1px solid #d8dde5', borderRadius: '3px',
  backgroundColor: '#fff', color: '#1c2638', fontSize: '0.9rem', fontFamily: 'Inter, system-ui, sans-serif', boxSizing: 'border-box',
}
const labelSt: React.CSSProperties = {
  display: 'block', fontSize: '0.72rem', fontWeight: '600', color: '#6b7689',
  marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Inter, system-ui, sans-serif',
}

export default function BidForm({ jobId, jobName }: Props) {
  const today = new Date().toISOString().slice(0, 10)

  const [companyName, setCompanyName] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [trade, setTrade] = useState('')
  const [bidDate, setBidDate] = useState(today)
  const [validUntil, setValidUntil] = useState('')
  const [lineItems, setLineItems] = useState<LineItem[]>([newLine()])
  const [inclusions, setInclusions] = useState('')
  const [exclusions, setExclusions] = useState('')
  const [qualifications, setQualifications] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const autoTotal = lineItems.reduce((sum, li) => sum + (parseFloat(li.totalPrice) || 0), 0)

  function updateLine(localId: string, field: keyof LineItem, value: string) {
    setLineItems((prev) => prev.map((li) => {
      if (li.localId !== localId) return li
      const updated = { ...li, [field]: value }
      if (field === 'quantity' || field === 'unitPrice') {
        const computed = calcTotal(field === 'quantity' ? value : li.quantity, field === 'unitPrice' ? value : li.unitPrice)
        if (computed) updated.totalPrice = computed
      }
      return updated
    }))
  }

  function removeLine(localId: string) {
    setLineItems((prev) => prev.filter((li) => li.localId !== localId))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          subcontractorName: companyName,
          subcontractorEmail: contactEmail || null,
          trade,
          bidDate,
          validUntil: validUntil || null,
          totalAmount: autoTotal || 0,
          inclusions: inclusions || null,
          exclusions: exclusions || null,
          qualifications: qualifications || null,
          rawSubmissionData: { contactName, source: 'form' },
          lineItems: lineItems.filter((li) => li.description).map((li, i) => ({
            sortOrder: i + 1,
            description: li.description,
            quantity: li.quantity ? parseFloat(li.quantity) : null,
            unit: li.unit || null,
            unitPrice: li.unitPrice ? parseFloat(li.unitPrice) : null,
            totalPrice: parseFloat(li.totalPrice) || 0,
          })),
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
      <div className="card" style={{ padding: '40px 28px', textAlign: 'center' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#e3eef5', display: 'grid', placeItems: 'center', margin: '0 auto 16px', fontSize: '1.2rem', color: '#1f5288' }}>&#10003;</div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.3rem', fontWeight: '600', color: '#2c3e6b', marginBottom: '10px' }}>
          Bid submitted
        </h2>
        <p style={{ color: '#6b7689', fontSize: '0.9rem', lineHeight: '1.6' }}>
          Your bid for {jobName} has been received. The project manager will be in touch.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Company info */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelSt}>Company Name</label>
            <input style={inputSt} required value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Coastal Electric LLC" />
          </div>
          <div>
            <label style={labelSt}>Contact Name</label>
            <input style={inputSt} required value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Mike Torres" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelSt}>Contact Email</label>
            <input style={inputSt} type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="mike@coastalelectric.com" />
          </div>
          <div>
            <label style={labelSt}>Trade / Scope</label>
            <input style={inputSt} required value={trade} onChange={(e) => setTrade(e.target.value)} placeholder="Electrical" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelSt}>Bid Date</label>
            <input style={inputSt} type="date" required value={bidDate} onChange={(e) => setBidDate(e.target.value)} />
          </div>
          <div>
            <label style={labelSt}>Valid Until <span style={{ fontWeight: '400', textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <input style={inputSt} type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Line items */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 70px 80px 100px 100px 32px', gap: '8px', marginBottom: '8px', fontSize: '0.72rem', fontWeight: '600', color: '#6b7689', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          <span>Description</span><span>Qty</span><span>Unit</span><span>Unit Price</span><span>Total</span><span />
        </div>
        {lineItems.map((li) => (
          <div key={li.localId} style={{ display: 'grid', gridTemplateColumns: '2fr 70px 80px 100px 100px 32px', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
            <input style={inputSt} placeholder="Description" value={li.description} onChange={(e) => updateLine(li.localId, 'description', e.target.value)} />
            <input style={inputSt} type="number" min="0" step="any" placeholder="1" value={li.quantity} onChange={(e) => updateLine(li.localId, 'quantity', e.target.value)} />
            <select style={inputSt} value={li.unit} onChange={(e) => updateLine(li.localId, 'unit', e.target.value)}>
              {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
            <input style={inputSt} type="number" min="0" step="0.01" placeholder="0.00" value={li.unitPrice} onChange={(e) => updateLine(li.localId, 'unitPrice', e.target.value)} />
            <input style={inputSt} type="number" min="0" step="0.01" placeholder="0.00" value={li.totalPrice} onChange={(e) => updateLine(li.localId, 'totalPrice', e.target.value)} />
            <button type="button" onClick={() => removeLine(li.localId)} disabled={lineItems.length === 1} style={{ background: 'none', border: 'none', color: '#6b7689', cursor: lineItems.length === 1 ? 'not-allowed' : 'pointer', fontSize: '1rem', padding: '0', lineHeight: 1 }}>×</button>
          </div>
        ))}
        <button type="button" onClick={() => setLineItems((p) => [...p, newLine()])} style={{ marginTop: '8px', background: 'none', border: '1px dashed #d8dde5', borderRadius: '3px', padding: '6px 14px', fontSize: '0.78rem', color: '#6b7689', cursor: 'pointer', width: '100%' }}>
          + Add Line
        </button>
        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.78rem', color: '#6b7689', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Bid Total</span>
          <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.4rem', fontWeight: '600', color: '#2c3e6b' }}>
            {autoTotal > 0 ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(autoTotal) : '—'}
          </span>
        </div>
      </div>

      {/* Inclusions / exclusions / qualifications */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={labelSt}>Inclusions <span style={{ fontWeight: '400', textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
          <textarea style={{ ...inputSt, resize: 'vertical', minHeight: '80px' }} value={inclusions} onChange={(e) => setInclusions(e.target.value)} placeholder="What's included in this bid..." />
        </div>
        <div>
          <label style={labelSt}>Exclusions <span style={{ fontWeight: '400', textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
          <textarea style={{ ...inputSt, resize: 'vertical', minHeight: '80px' }} value={exclusions} onChange={(e) => setExclusions(e.target.value)} placeholder="What's not included..." />
        </div>
        <div>
          <label style={labelSt}>Qualifications / Notes <span style={{ fontWeight: '400', textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
          <textarea style={{ ...inputSt, resize: 'vertical', minHeight: '80px' }} value={qualifications} onChange={(e) => setQualifications(e.target.value)} placeholder="Assumptions, clarifications, lead times..." />
        </div>
      </div>

      {error && <p style={{ color: '#c0392b', fontSize: '0.85rem', margin: 0 }}>{error}</p>}

      <button
        type="submit"
        disabled={loading || !companyName || !contactName || !trade || lineItems.every((li) => !li.description)}
        style={{
          padding: '16px', borderRadius: '3px', border: 'none', fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '0.78rem', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase',
          backgroundColor: '#2c3e6b', color: '#fff', cursor: 'pointer', width: '100%',
        }}
      >
        {loading ? 'Submitting...' : 'Submit Bid'}
      </button>

      <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#6b7689', fontFamily: 'Inter, system-ui, sans-serif' }}>
        {jobName} · ParsCo Construction
      </p>
    </form>
  )
}
