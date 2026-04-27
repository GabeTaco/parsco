import { db } from '@/lib/db'
import { jobs, issues, bids } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'
import Nav from '@/components/Nav'
import Link from 'next/link'

function today() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

const modules = [
  {
    id: 'daily-reports',
    category: 'Field Ops',
    name: 'Daily Reports',
    description: 'Superintendent end-of-day logs with AI-generated executive briefings.',
    status: 'live' as const,
    href: '/admin?tab=site-reports',
  },
  {
    id: 'bid-management',
    category: 'Procurement',
    name: 'Bid Management',
    description: 'Issue bid packages to subcontractors and review incoming submissions.',
    status: 'live' as const,
    href: '/admin?tab=bids',
  },
  {
    id: 'asks',
    category: 'Communication',
    name: 'Asks & Approvals',
    description: 'Send trackable requests to any stakeholder and close the loop in real time.',
    status: 'soon' as const,
    href: null,
  },
  {
    id: 'contacts',
    category: 'Directory',
    name: 'Contact Directory',
    description: 'Subcontractors, vendors, clients, inspectors — searchable by job or trade.',
    status: 'soon' as const,
    href: null,
  },
  {
    id: 'rfi',
    category: 'Field Ops',
    name: 'RFI Tracker',
    description: 'Open and closed request-for-information log with response tracking per job.',
    status: 'soon' as const,
    href: null,
  },
  {
    id: 'submittals',
    category: 'Procurement',
    name: 'Submittal Log',
    description: 'Shop drawings and material approval tracking with review cycle history.',
    status: 'soon' as const,
    href: null,
  },
  {
    id: 'change-orders',
    category: 'Financial',
    name: 'Change Orders',
    description: 'CO pipeline with approval status, margin impact, and owner sign-off.',
    status: 'soon' as const,
    href: null,
  },
  {
    id: 'schedule',
    category: 'Planning',
    name: 'Schedule Control',
    description: 'Milestone tracking, critical path analysis, and variance alerts.',
    status: 'soon' as const,
    href: null,
  },
  {
    id: 'documents',
    category: 'Records',
    name: 'Document Vault',
    description: 'Plans, specifications, contracts, permits — versioned and indexed.',
    status: 'soon' as const,
    href: null,
  },
  {
    id: 'closeout',
    category: 'Closeout',
    name: 'Project Closeout',
    description: 'Punch list management, warranty registry, and as-built documentation.',
    status: 'soon' as const,
    href: null,
  },
]

export default async function CmdPortalPage() {
  const [activeJobsResult, openIssuesResult, pendingBidsResult] = await Promise.all([
    db.select({ count: count() }).from(jobs).where(eq(jobs.status, 'active')),
    db.select({ count: count() }).from(issues).where(eq(issues.isOpen, true)),
    db.select({ count: count() }).from(bids).where(eq(bids.status, 'submitted')),
  ])

  const activeJobs = activeJobsResult[0]?.count ?? 0
  const openIssues = openIssuesResult[0]?.count ?? 0
  const pendingBids = pendingBidsResult[0]?.count ?? 0

  const liveModules = modules.filter((m) => m.status === 'live').length
  const totalModules = modules.length

  return (
    <>
      <Nav />
      <main className="page" style={{ maxWidth: '960px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div className="tiny" style={{ marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{today()}</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: '2.4rem', fontWeight: 600, color: 'var(--navy)', margin: '0 0 6px', letterSpacing: '0.005em' }}>
            Command Center
          </h1>
          <p className="muted" style={{ fontSize: '0.88rem', margin: 0 }}>
            {liveModules} of {totalModules} modules live · ParsCo Operations Platform
          </p>
        </div>

        {/* KPI Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '40px' }}>
          {[
            { label: 'Active Jobs', value: activeJobs },
            { label: 'Open Issues', value: openIssues },
            { label: 'Bids Pending Review', value: pendingBids },
          ].map((stat) => (
            <div
              key={stat.label}
              className="card"
              style={{ textAlign: 'center', padding: '20px 16px' }}
            >
              <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: '2.2rem', lineHeight: 1.1, color: 'var(--navy)' }}>
                {stat.value}
              </div>
              <div className="tiny" style={{ marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Module Grid */}
        <div style={{ marginBottom: '16px' }}>
          <span className="section-label">Modules</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {modules.map((mod) => {
            const inner = (
              <div
                className={`card${mod.status === 'live' ? ' card-strong hoverable' : ''}`}
                style={{ cursor: mod.href ? 'pointer' : 'default', opacity: mod.status === 'soon' ? 0.72 : 1 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span className="smallcaps">{mod.category}</span>
                  <span
                    className={`badge ${mod.status === 'live' ? 'badge--active' : 'badge--complete'}`}
                    style={{ fontSize: '0.65rem' }}
                  >
                    {mod.status === 'live' ? 'Live' : 'Soon'}
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: '1.1rem', color: 'var(--navy)', marginBottom: '6px' }}>
                  {mod.name}
                </div>
                <div className="muted" style={{ fontSize: '0.82rem', lineHeight: '1.5' }}>
                  {mod.description}
                </div>
              </div>
            )

            return mod.href ? (
              <Link key={mod.id} href={mod.href} style={{ textDecoration: 'none' }}>
                {inner}
              </Link>
            ) : (
              <div key={mod.id}>{inner}</div>
            )
          })}
        </div>
      </main>
    </>
  )
}
