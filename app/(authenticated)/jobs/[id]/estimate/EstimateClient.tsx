'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const CSI: Record<number, string> = {
  1: 'General Requirements', 2: 'Site Construction', 3: 'Concrete',
  4: 'Masonry / Exterior Cladding', 5: 'Metals', 6: 'Wood & Plastics',
  7: 'Thermal & Moisture Protection', 8: 'Doors & Windows', 9: 'Finishes',
  10: 'Specialties', 11: 'Equipment', 12: 'Furnishings',
  13: 'Special Construction', 14: 'Conveying Systems', 15: 'Mechanical', 16: 'Electrical',
}

const LABOR_BURDEN = 0.38
const SALES_TAX = 0.075
const OVERHEAD_PCT = 0.10
const FEE_PCT = 0.10

export interface EstimateItem {
  id: string
  csiDivision: number
  itemNumber: string
  description: string
  qty: string
  unit: string
  laborUnit: string
  laborTotal: string
  materialUnit: string
  materialTotal: string
  subUnit: string
  subTotal: string
  equipUnit: string
  equipTotal: string
  lineTotal: string
  bic: string
  sortOrder: number
}

interface Props {
  jobId: string
  jobName: string
  estimate: { id: string; name: string } | null
  initialItems: EstimateItem[]
}

const $ = (n: number | string) => {
  const v = typeof n === 'string' ? parseFloat(n) : n
  if (!v || isNaN(v)) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)
}

const num = (v: string | number) => parseFloat(String(v)) || 0

function recompute(item: EstimateItem): EstimateItem {
  const qty = num(item.qty)
  const lT = qty * num(item.laborUnit)
  const mT = qty * num(item.materialUnit)
  const sT = qty * num(item.subUnit)
  const eT = qty * num(item.equipUnit)
  return { ...item, laborTotal: String(lT), materialTotal: String(mT), subTotal: String(sT), equipTotal: String(eT), lineTotal: String(lT + mT + sT + eT) }
}

function NumCell({ val, onChange, bg }: { val: string; onChange?: (v: string) => void; bg?: string }) {
  const [editing, setEditing] = useState(false)
  const cellStyle: React.CSSProperties = {
    padding: '4px 6px', textAlign: 'right', fontSize: '0.78rem',
    background: bg ?? 'transparent', whiteSpace: 'nowrap',
  }
  if (!onChange) return <td style={cellStyle}>{$(val)}</td>
  if (editing) return (
    <td style={{ ...cellStyle, padding: 0 }}>
      <input
        type="number"
        defaultValue={parseFloat(val) || ''}
        onBlur={(e) => { onChange(e.target.value || '0'); setEditing(false) }}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Tab') { onChange((e.target as HTMLInputElement).value || '0'); setEditing(false) } }}
        autoFocus
        style={{ width: '100%', border: 'none', padding: '4px 6px', textAlign: 'right', fontSize: '0.78rem', outline: '2px solid var(--navy)', background: '#fff' }}
      />
    </td>
  )
  return (
    <td style={{ ...cellStyle, cursor: 'text' }} onClick={() => setEditing(true)}>
      {$(val)}
    </td>
  )
}

function TxtCell({ val, onChange, width }: { val: string; onChange: (v: string) => void; width?: string }) {
  const [editing, setEditing] = useState(false)
  const cellStyle: React.CSSProperties = { padding: '4px 6px', fontSize: '0.78rem', whiteSpace: 'nowrap', width }
  if (editing) return (
    <td style={{ ...cellStyle, padding: 0 }}>
      <input
        type="text"
        defaultValue={val}
        onBlur={(e) => { onChange(e.target.value); setEditing(false) }}
        onKeyDown={(e) => { if (e.key === 'Enter') { onChange((e.target as HTMLInputElement).value); setEditing(false) } }}
        autoFocus
        style={{ width: '100%', border: 'none', padding: '4px 6px', fontSize: '0.78rem', outline: '2px solid var(--navy)' }}
      />
    </td>
  )
  return (
    <td style={{ ...cellStyle, cursor: 'text' }} onClick={() => setEditing(true)}>
      {val || <span style={{ color: 'var(--muted)' }}>—</span>}
    </td>
  )
}

export default function EstimateClient({ jobId, jobName, estimate: initialEstimate, initialItems }: Props) {
  const router = useRouter()
  const [estimate, setEstimate] = useState(initialEstimate)
  const [items, setItems] = useState<EstimateItem[]>(initialItems)
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [creating, setCreating] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [showGenModal, setShowGenModal] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const updateItem = useCallback((id: string, field: keyof EstimateItem, value: string) => {
    setItems(prev => {
      const updated = prev.map(item => {
        if (item.id !== id) return item
        const next = { ...item, [field]: value }
        if (['qty', 'laborUnit', 'materialUnit', 'subUnit', 'equipUnit'].includes(field)) return recompute(next)
        return next
      })
      return updated
    })
    setDirtyIds(prev => new Set(prev).add(id))
  }, [])

  const addRow = useCallback(async (div: number) => {
    if (!estimate) return
    const tmpId = `tmp_${Date.now()}`
    const newItem: EstimateItem = {
      id: tmpId, csiDivision: div, itemNumber: '', description: 'New item',
      qty: '1', unit: 'LS', laborUnit: '0', laborTotal: '0', materialUnit: '0',
      materialTotal: '0', subUnit: '0', subTotal: '0', equipUnit: '0', equipTotal: '0',
      lineTotal: '0', bic: '', sortOrder: items.filter(i => i.csiDivision === div).length,
    }
    setItems(prev => [...prev, newItem])
    setDirtyIds(prev => new Set(prev).add(tmpId))
  }, [estimate, items])

  const deleteRow = useCallback(async (id: string, estimateId: string) => {
    if (id.startsWith('tmp_')) {
      setItems(prev => prev.filter(i => i.id !== id))
      setDirtyIds(prev => { const s = new Set(prev); s.delete(id); return s })
      return
    }
    await fetch(`/api/estimates/${estimateId}/items/${id}`, { method: 'DELETE' })
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const saveAll = async () => {
    if (!estimate || dirtyIds.size === 0) return
    setSaving(true)
    const dirty = items.filter(i => dirtyIds.has(i.id))
    const res = await fetch(`/api/estimates/${estimate.id}/items`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: dirty }),
    })
    if (res.ok) {
      const { updated } = await res.json()
      const idMap = new Map<string, string>(updated.map((u: { tmpId: string; realId: string }) => [u.tmpId, u.realId] as [string, string]))
      setItems(prev => prev.map(i => { const newId = idMap.get(i.id); return newId ? { ...i, id: newId } : i }))
      setDirtyIds(new Set())
    }
    setSaving(false)
  }

  const createEstimate = async () => {
    setCreating(true)
    const res = await fetch('/api/estimates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId }),
    })
    const { estimate: newEst } = await res.json()
    setEstimate(newEst)
    setCreating(false)
  }

  const handleGenerate = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) return
    setGenerating(true)
    const form = new FormData()
    form.append('pdf', file)
    form.append('jobId', jobId)
    const res = await fetch('/api/estimates/generate', { method: 'POST', body: form })
    if (res.ok) {
      setShowGenModal(false)
      router.refresh()
    } else {
      const err = await res.json()
      alert(err.error ?? 'Generation failed')
    }
    setGenerating(false)
  }

  // Computed totals
  const laborSub = items.reduce((s, i) => s + num(i.laborTotal), 0)
  const materialSub = items.reduce((s, i) => s + num(i.materialTotal), 0)
  const subSub = items.reduce((s, i) => s + num(i.subTotal), 0)
  const equipSub = items.reduce((s, i) => s + num(i.equipTotal), 0)
  const costSub = laborSub + materialSub + subSub + equipSub
  const laborBurden = laborSub * LABOR_BURDEN
  const salesTax = materialSub * SALES_TAX
  const subtotal2 = costSub + laborBurden + salesTax
  const overhead = subtotal2 * OVERHEAD_PCT
  const fee = (subtotal2 + overhead) * FEE_PCT
  const grandTotal = subtotal2 + overhead + fee

  const divisionGroups = Array.from({ length: 16 }, (_, i) => i + 1).map(div => ({
    div,
    items: items.filter(i => i.csiDivision === div),
    total: items.filter(i => i.csiDivision === div).reduce((s, i) => s + num(i.lineTotal), 0),
  })).filter(g => g.items.length > 0 || estimate)

  const TH: React.CSSProperties = {
    padding: '6px 6px', fontSize: '0.68rem', fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--steel)',
    background: '#fff', borderBottom: '2px solid var(--border)', textAlign: 'right',
    whiteSpace: 'nowrap', position: 'sticky', top: 0, zIndex: 2,
  }

  if (!estimate) return (
    <div style={{ paddingTop: '40px' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '2rem', fontWeight: 600, color: 'var(--navy)', margin: '0 0 8px' }}>Estimate</h1>
      <p className="muted" style={{ marginBottom: '32px', fontSize: '0.88rem' }}>{jobName}</p>
      <div className="card" style={{ maxWidth: '500px', textAlign: 'center', padding: '48px 32px' }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: '1.3rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '12px' }}>No estimate yet</div>
        <p className="muted" style={{ fontSize: '0.85rem', marginBottom: '24px' }}>Start with a blank CSI 16-division estimate or generate one from your drawings.</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={createEstimate} disabled={creating}>
            {creating ? 'Creating…' : 'Create Blank Estimate'}
          </button>
          <button className="btn" onClick={() => setShowGenModal(true)}>
            ✦ Generate from Drawings
          </button>
        </div>
      </div>
      {showGenModal && (
        <GenModal
          fileRef={fileRef}
          generating={generating}
          onGenerate={handleGenerate}
          onClose={() => setShowGenModal(false)}
          needsEstimate={true}
          onCreateFirst={createEstimate}
        />
      )}
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="row-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: '2rem', fontWeight: 600, color: 'var(--navy)', margin: '0 0 4px' }}>
            {estimate.name}
          </h1>
          <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>{jobName}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {dirtyIds.size > 0 && (
            <span className="tiny" style={{ color: 'var(--flag-yellow)' }}>
              {dirtyIds.size} unsaved change{dirtyIds.size !== 1 ? 's' : ''}
            </span>
          )}
          <button className="btn" onClick={() => setShowGenModal(true)}>✦ Generate from Drawings</button>
          <button className="btn btn-primary" onClick={saveAll} disabled={saving || dirtyIds.size === 0}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Grand Total KPI */}
      <div className="card" style={{ marginBottom: '20px', background: 'var(--navy)', border: 'none', padding: '16px 24px' }}>
        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
          {[
            { label: 'Cost Subtotal', value: costSub },
            { label: 'W/ Burden & Tax', value: subtotal2 },
            { label: 'Overhead (10%)', value: overhead },
            { label: 'Fee (10%)', value: fee },
            { label: 'Grand Total', value: grandTotal, bold: true },
          ].map(stat => (
            <div key={stat.label}>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>{stat.label}</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: stat.bold ? '1.6rem' : '1.1rem', fontWeight: 600, color: '#fff' }}>
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(stat.value)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Estimate Table */}
      <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--r-card)' }}>
        <table style={{ minWidth: '1180px', borderCollapse: 'collapse', width: '100%', fontSize: '0.78rem' }}>
          <thead>
            <tr>
              <th style={{ ...TH, textAlign: 'left', width: '44px' }}>#</th>
              <th style={{ ...TH, textAlign: 'left', width: '220px', position: 'sticky', left: 0, zIndex: 3 }}>Description</th>
              <th style={{ ...TH, width: '56px' }}>Qty</th>
              <th style={{ ...TH, width: '52px' }}>Unit</th>
              <th style={{ ...TH, width: '78px', borderLeft: '1px solid var(--border)' }}>Labor $/u</th>
              <th style={{ ...TH, width: '78px', background: 'var(--bg)' }}>Labor $</th>
              <th style={{ ...TH, width: '78px', borderLeft: '1px solid var(--border)' }}>Mat $/u</th>
              <th style={{ ...TH, width: '78px', background: 'var(--bg)' }}>Mat $</th>
              <th style={{ ...TH, width: '78px', borderLeft: '1px solid var(--border)' }}>Sub $/u</th>
              <th style={{ ...TH, width: '78px', background: 'var(--bg)' }}>Sub $</th>
              <th style={{ ...TH, width: '78px', borderLeft: '1px solid var(--border)' }}>Equip $/u</th>
              <th style={{ ...TH, width: '78px', background: 'var(--bg)' }}>Equip $</th>
              <th style={{ ...TH, width: '88px', borderLeft: '2px solid var(--border)', color: 'var(--navy)' }}>TOTAL</th>
              <th style={{ ...TH, width: '80px' }}>BIC</th>
              <th style={{ ...TH, width: '28px' }}></th>
            </tr>
          </thead>
          <tbody>
            {divisionGroups.map(({ div, items: divItems, total }) => (
              <>
                {/* Division header */}
                <tr key={`div-${div}`} style={{ background: 'var(--navy)' }}>
                  <td colSpan={12} style={{ padding: '8px 8px', fontFamily: 'var(--serif)', fontWeight: 600, fontSize: '0.85rem', color: '#fff' }}>
                    Division {div} — {CSI[div]}
                  </td>
                  <td style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 600, fontSize: '0.82rem', color: '#fff', borderLeft: '2px solid rgba(255,255,255,0.2)' }}>
                    {$(total)}
                  </td>
                  <td colSpan={2} style={{ background: 'var(--navy)' }}></td>
                </tr>

                {/* Items */}
                {divItems.map((item) => {
                  const isDirty = dirtyIds.has(item.id)
                  return (
                    <tr
                      key={item.id}
                      style={{ borderBottom: '1px solid var(--border)', background: isDirty ? '#fffbf0' : '#fff' }}
                    >
                      <TxtCell val={item.itemNumber} onChange={v => updateItem(item.id, 'itemNumber', v)} width="44px" />
                      <td style={{ padding: 0, position: 'sticky', left: 0, background: isDirty ? '#fffbf0' : '#fff', zIndex: 1, borderRight: '1px solid var(--border)' }}>
                        <TxtCell val={item.description} onChange={v => updateItem(item.id, 'description', v)} />
                      </td>
                      <NumCell val={item.qty} onChange={v => updateItem(item.id, 'qty', v)} />
                      <TxtCell val={item.unit} onChange={v => updateItem(item.id, 'unit', v)} width="52px" />
                      <NumCell val={item.laborUnit} onChange={v => updateItem(item.id, 'laborUnit', v)} />
                      <NumCell val={item.laborTotal} bg="var(--bg)" />
                      <NumCell val={item.materialUnit} onChange={v => updateItem(item.id, 'materialUnit', v)} />
                      <NumCell val={item.materialTotal} bg="var(--bg)" />
                      <NumCell val={item.subUnit} onChange={v => updateItem(item.id, 'subUnit', v)} />
                      <NumCell val={item.subTotal} bg="var(--bg)" />
                      <NumCell val={item.equipUnit} onChange={v => updateItem(item.id, 'equipUnit', v)} />
                      <NumCell val={item.equipTotal} bg="var(--bg)" />
                      <td style={{ padding: '4px 6px', textAlign: 'right', fontWeight: 600, borderLeft: '2px solid var(--border)', whiteSpace: 'nowrap' }}>
                        {$(item.lineTotal)}
                      </td>
                      <TxtCell val={item.bic} onChange={v => updateItem(item.id, 'bic', v)} width="80px" />
                      <td style={{ padding: '4px 4px', textAlign: 'center' }}>
                        <button
                          onClick={() => deleteRow(item.id, estimate.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '0.85rem', padding: '2px 4px', lineHeight: 1 }}
                          title="Delete row"
                        >×</button>
                      </td>
                    </tr>
                  )
                })}

                {/* Add row */}
                <tr key={`add-${div}`} style={{ borderBottom: '2px solid var(--border)' }}>
                  <td colSpan={15} style={{ padding: '6px 8px' }}>
                    <button
                      onClick={() => addRow(div)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--steel)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}
                    >
                      + Add item to Division {div}
                    </button>
                  </td>
                </tr>
              </>
            ))}

            {/* Add a new division */}
            <tr>
              <td colSpan={15} style={{ padding: '8px 8px', borderTop: '2px solid var(--border)' }}>
                <AddDivisionRow existingDivs={new Set(divisionGroups.map(g => g.div))} onAdd={addRow} />
              </td>
            </tr>
          </tbody>

          {/* Totals footer */}
          <tfoot>
            <tr style={{ background: 'var(--bg)', borderTop: '3px solid var(--border)' }}>
              <td colSpan={4} style={{ padding: '8px 8px', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--steel)' }}>Subtotals</td>
              <td></td>
              <td style={{ padding: '6px', textAlign: 'right', fontWeight: 600, background: 'var(--bg)' }}>{$(laborSub)}</td>
              <td></td>
              <td style={{ padding: '6px', textAlign: 'right', fontWeight: 600, background: 'var(--bg)' }}>{$(materialSub)}</td>
              <td></td>
              <td style={{ padding: '6px', textAlign: 'right', fontWeight: 600, background: 'var(--bg)' }}>{$(subSub)}</td>
              <td></td>
              <td style={{ padding: '6px', textAlign: 'right', fontWeight: 600, background: 'var(--bg)' }}>{$(equipSub)}</td>
              <td style={{ padding: '6px', textAlign: 'right', fontWeight: 700, borderLeft: '2px solid var(--border)' }}>{$(costSub)}</td>
              <td colSpan={2}></td>
            </tr>
            {[
              { label: `Labor Burden (${(LABOR_BURDEN * 100).toFixed(0)}%)`, value: laborBurden },
              { label: `Sales Tax (${(SALES_TAX * 100).toFixed(1)}%)`, value: salesTax },
              { label: 'Subtotal w/ Burden & Tax', value: subtotal2, bold: true },
              { label: `Overhead (${(OVERHEAD_PCT * 100).toFixed(0)}%)`, value: overhead },
              { label: `Fee (${(FEE_PCT * 100).toFixed(0)}%)`, value: fee },
            ].map(row => (
              <tr key={row.label} style={{ background: 'var(--bg)' }}>
                <td colSpan={12} style={{ padding: '4px 8px', textAlign: 'right', fontSize: '0.78rem', color: row.bold ? 'var(--navy)' : 'var(--muted)', fontWeight: row.bold ? 700 : 400 }}>{row.label}</td>
                <td style={{ padding: '4px 6px', textAlign: 'right', fontWeight: row.bold ? 700 : 400, borderLeft: '2px solid var(--border)', color: row.bold ? 'var(--navy)' : undefined }}>{$(row.value)}</td>
                <td colSpan={2}></td>
              </tr>
            ))}
            <tr style={{ background: 'var(--navy)' }}>
              <td colSpan={12} style={{ padding: '10px 8px', textAlign: 'right', fontFamily: 'var(--serif)', fontSize: '1rem', fontWeight: 600, color: '#fff' }}>Grand Total</td>
              <td style={{ padding: '10px 6px', textAlign: 'right', fontFamily: 'var(--serif)', fontSize: '1.1rem', fontWeight: 700, color: '#fff', borderLeft: '2px solid rgba(255,255,255,0.3)' }}>
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(grandTotal)}
              </td>
              <td colSpan={2} style={{ background: 'var(--navy)' }}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {showGenModal && (
        <GenModal
          fileRef={fileRef}
          generating={generating}
          onGenerate={handleGenerate}
          onClose={() => setShowGenModal(false)}
          needsEstimate={false}
          onCreateFirst={() => {}}
        />
      )}
    </div>
  )
}

function AddDivisionRow({ existingDivs, onAdd }: { existingDivs: Set<number>; onAdd: (div: number) => void }) {
  const [selected, setSelected] = useState('')
  const available = Array.from({ length: 16 }, (_, i) => i + 1).filter(d => !existingDivs.has(d))
  if (available.length === 0) return null
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <select
        className="select"
        value={selected}
        onChange={e => setSelected(e.target.value)}
        style={{ maxWidth: '260px', fontSize: '0.78rem', padding: '4px 8px' }}
      >
        <option value="">Add a CSI division…</option>
        {available.map(d => <option key={d} value={d}>Division {d} — {CSI[d]}</option>)}
      </select>
      {selected && (
        <button className="btn" onClick={() => { onAdd(Number(selected)); setSelected('') }} style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
          Add
        </button>
      )}
    </div>
  )
}

function GenModal({ fileRef, generating, onGenerate, onClose, needsEstimate, onCreateFirst }: {
  fileRef: React.RefObject<HTMLInputElement | null>
  generating: boolean
  onGenerate: () => void
  onClose: () => void
  needsEstimate: boolean
  onCreateFirst: () => void
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div className="card" style={{ width: '440px', padding: '32px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '12px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--muted)' }}>×</button>
        <div style={{ fontFamily: 'var(--serif)', fontSize: '1.3rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '8px' }}>
          Generate from Drawings
        </div>
        <p className="muted" style={{ fontSize: '0.85rem', marginBottom: '20px' }}>
          Upload your drawing set (PDF). Claude will analyze the plans and generate a CSI 16-Division estimate with quantities and unit costs for the Gulf Coast market.
        </p>
        <div className="form-group">
          <label className="form-label">Drawing Set (PDF, max 32MB)</label>
          <input ref={fileRef} type="file" accept=".pdf" className="input" />
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={onGenerate}
            disabled={generating}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            {generating ? 'Analyzing drawings…' : '✦ Generate Estimate'}
          </button>
        </div>
        <p className="tiny" style={{ marginTop: '12px', textAlign: 'center' }}>Takes 30–60 seconds · Replaces existing estimate if one exists</p>
      </div>
    </div>
  )
}
