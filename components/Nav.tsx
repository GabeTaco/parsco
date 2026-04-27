import Link from 'next/link'

export default function Nav() {
  return (
    <nav
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #d8cfc2',
        padding: '0 24px',
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Link
        href="/jobs"
        className="serif"
        style={{
          fontSize: '1.1rem',
          fontWeight: 'normal',
          color: '#1a1512',
          textDecoration: 'none',
          letterSpacing: '0.02em',
        }}
      >
        Parsco
      </Link>
      <div style={{ display: 'flex', gap: '24px' }}>
        <Link
          href="/jobs"
          style={{ color: '#8a7e74', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '500' }}
        >
          Jobs
        </Link>
        <Link
          href="/digest"
          style={{ color: '#8a7e74', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '500' }}
        >
          Digest
        </Link>
        <Link
          href="/admin/tokens"
          style={{ color: '#8a7e74', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '500' }}
        >
          Admin
        </Link>
      </div>
    </nav>
  )
}
