import Link from 'next/link'

export default function Nav() {
  return (
    <nav className="nav">
      <Link href="/jobs" className="serif nav__brand">
        Parsco
      </Link>
      <div className="nav__links">
        <Link href="/jobs" className="nav__link">
          Jobs
        </Link>
        <Link href="/digest" className="nav__link">
          Digest
        </Link>
        <Link href="/admin/tokens" className="nav__link">
          Admin
        </Link>
      </div>
    </nav>
  )
}
