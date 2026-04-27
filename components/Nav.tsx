'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Nav() {
  const pathname = usePathname()

  return (
    <>
      <nav className="nav">
        <Link href="/jobs" className="nav-brand">
          <img src="/parsco-logo.png" alt="ParsCo" style={{ height: '30px' }} />
        </Link>
        <ul className="nav-links">
          <li>
            <Link href="/jobs" className={pathname.startsWith('/jobs') ? 'active' : ''}>
              Jobs
            </Link>
          </li>
          <li>
            <Link href="/admin" className={pathname.startsWith('/admin') ? 'active' : ''}>
              Admin
            </Link>
          </li>
          <li>
            <Link href="/cmd" className={pathname.startsWith('/cmd') ? 'active' : ''}>
              CMD
            </Link>
          </li>
        </ul>
        <div className="nav-right">
          <span className="tiny">Project Executive</span>
          <div className="nav-user">AF</div>
        </div>
      </nav>
      <div className="sub-bar">
        <span><b>700 N. Devilliers</b>, Pensacola FL 32501</span>
        <span className="dot">·</span>
        <span><b>(850) 696-7656</b></span>
        <span className="dot">·</span>
        <span>info@pars-co.net</span>
        <span className="dot">·</span>
        <span>License #: <b>CGC1512307</b></span>
      </div>
    </>
  )
}
