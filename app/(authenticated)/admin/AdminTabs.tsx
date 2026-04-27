'use client'

import Link from 'next/link'

export default function AdminTabs({ active }: { active: string }) {
  return (
    <div style={{ display: 'flex', gap: '18px', borderBottom: '1px solid var(--border)', marginBottom: '32px' }}>
      {[
        { key: 'site-reports', label: 'Site Reports' },
        { key: 'bids', label: 'Bids' },
      ].map(({ key, label }) => (
        <Link
          key={key}
          href={`/admin?tab=${key}`}
          style={{
            paddingBottom: '10px',
            fontSize: '0.85rem',
            fontWeight: '500',
            textDecoration: 'none',
            color: active === key ? 'var(--navy)' : 'var(--muted)',
            borderBottom: active === key ? '2px solid var(--navy)' : '2px solid transparent',
            marginBottom: '-1px',
            transition: 'color 0.15s',
          }}
        >
          {label}
        </Link>
      ))}
    </div>
  )
}
