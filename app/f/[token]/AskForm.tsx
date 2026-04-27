'use client'

import { useState } from 'react'
import type { FormSchema } from '@/lib/ask-forms'

interface Props {
  token: string
  schema: FormSchema
}

export default function AskForm({ token, schema }: Props) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/f/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, formData: values }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Submission failed')
      }
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <div style={{ fontSize: '2rem', marginBottom: '12px' }}>✓</div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: '1.4rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '8px' }}>
          Response Received
        </div>
        <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>
          Thank you. Your response has been recorded.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      {schema.fields.map((field) => (
        <div key={field.key} className="form-group">
          <label className="form-label">
            {field.label}{field.required && <span style={{ color: 'var(--flag-red)', marginLeft: '3px' }}>*</span>}
          </label>

          {field.type === 'textarea' && (
            <textarea
              className="textarea"
              placeholder={field.placeholder}
              required={field.required}
              value={values[field.key] ?? ''}
              onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
            />
          )}

          {field.type === 'select' && (
            <select
              className="select"
              required={field.required}
              value={values[field.key] ?? ''}
              onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
            >
              <option value="">Select...</option>
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          )}

          {(field.type === 'text' || field.type === 'number' || field.type === 'date') && (
            <input
              className="input"
              type={field.type}
              placeholder={field.placeholder}
              required={field.required}
              value={values[field.key] ?? ''}
              onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
            />
          )}
        </div>
      ))}

      {error && (
        <div style={{ color: 'var(--flag-red)', fontSize: '0.85rem', marginBottom: '16px' }}>{error}</div>
      )}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={submitting}
        style={{ width: '100%', justifyContent: 'center' }}
      >
        {submitting ? 'Submitting…' : 'Submit Response'}
      </button>
    </form>
  )
}
