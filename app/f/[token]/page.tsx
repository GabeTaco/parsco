import { db } from '@/lib/db'
import { asks } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { FORM_SCHEMAS } from '@/lib/ask-forms'
import AskForm from './AskForm'

export default async function PublicAskFormPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const rows = await db.select().from(asks).where(eq(asks.tokenValue, token)).limit(1)
  if (rows.length === 0) notFound()

  const ask = rows[0]

  if (ask.status === 'responded') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: 'var(--sans)' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '40px 24px' }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: '1.8rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '12px' }}>
            Already Submitted
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            This request has already been responded to. Thank you.
          </p>
        </div>
      </div>
    )
  }

  if (ask.expiresAt && new Date(ask.expiresAt) < new Date()) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: 'var(--sans)' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '40px 24px' }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: '1.8rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '12px' }}>
            Link Expired
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            This request link is no longer active. Contact your project manager for a new link.
          </p>
        </div>
      </div>
    )
  }

  const schemaId = ask.formSchemaId ?? 'generic_request'
  const schema = FORM_SCHEMAS[schemaId] ?? FORM_SCHEMAS.generic_request

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--sans)', padding: '40px 16px' }}>
      <div style={{ maxWidth: '520px', margin: '0 auto' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--navy)', letterSpacing: '0.01em' }}>
            ParsCo Construction
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Pensacola, FL · CGC1512307
          </div>
        </div>

        {/* Form card */}
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderTop: '3px solid var(--navy)', borderRadius: 'var(--r-card)', padding: '32px 28px' }}>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.6rem', fontWeight: 600, color: 'var(--navy)', margin: '0 0 6px' }}>
            {ask.title}
          </h1>
          {ask.body && (
            <p style={{ color: 'var(--muted)', fontSize: '0.88rem', margin: '0 0 24px', lineHeight: '1.55' }}>
              {ask.body}
            </p>
          )}
          <AskForm token={token} schema={schema} />
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.75rem', color: 'var(--muted)' }}>
          Powered by ParsCo Operations Platform
        </div>
      </div>
    </div>
  )
}
