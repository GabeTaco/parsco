import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../lib/db/schema'

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL not set')

  const sql = neon(url)
  const db = drizzle(sql, { schema })

  console.log('Seeding database...')

  // Clear existing data in dependency order
  await db.delete(schema.pendingDecisions)
  await db.delete(schema.tokens)
  await db.delete(schema.siteReports)
  await db.delete(schema.issues)
  await db.delete(schema.jobs)

  console.log('Cleared existing data.')

  // Insert jobs
  const [job1] = await db.insert(schema.jobs).values({
    name: 'Beachview Remodel — 12 Marina Dr',
    clientName: 'Whitford Family',
    siteAddress: '12 Marina Dr',
    contractValue: '385000',
    currentSpend: '238700',
    status: 'active',
    startDate: '2025-11-01',
    targetCompletionDate: '2026-05-15',
    percentComplete: 62,
    daysVariance: -3,
  }).returning()

  const [job2] = await db.insert(schema.jobs).values({
    name: 'Office Buildout — Pensacola Tech Park Bldg C',
    clientName: 'Coastal Title Company',
    siteAddress: 'Pensacola Tech Park Bldg C',
    contractValue: '1240000',
    currentSpend: '509000',
    status: 'active',
    startDate: '2025-12-15',
    targetCompletionDate: '2026-07-01',
    percentComplete: 41,
    daysVariance: 0,
  }).returning()

  const [job3] = await db.insert(schema.jobs).values({
    name: 'New Construction — Cordova Park Residence',
    clientName: 'Beltran Custom Homes',
    siteAddress: 'Cordova Park',
    contractValue: '920000',
    currentSpend: '165600',
    status: 'active',
    startDate: '2026-01-20',
    targetCompletionDate: '2026-11-30',
    percentComplete: 18,
    daysVariance: 2,
  }).returning()

  console.log('Jobs inserted:', job1.id, job2.id, job3.id)

  // Insert issues
  await db.insert(schema.issues).values([
    {
      jobId: job1.id,
      flagColor: 'yellow',
      title: 'Cabinet delivery delayed 5 days',
      description: 'Supplier confirmed delay. Adjusted finish work schedule to compensate.',
      isOpen: true,
    },
    {
      jobId: job2.id,
      flagColor: 'red',
      title: 'MEP rough-in failed inspection — needs reroute',
      description: 'Inspector flagged conduit routing in south corridor. Reroute required before drywall.',
      isOpen: true,
    },
    {
      jobId: job2.id,
      flagColor: 'green',
      title: 'Owner approved finish package',
      description: 'Coastal Title confirmed Level 4 drywall and LVP flooring selection.',
      isOpen: true,
    },
  ])

  console.log('Issues inserted.')

  // Insert site reports
  // Job 1 — 2 reports
  await db.insert(schema.siteReports).values([
    {
      jobId: job1.id,
      superName: 'Marcus Delgado',
      reportDate: '2026-04-18',
      workCompleted: 'Completed tile installation in master bath and hall bath. Set vanities and prepped for plumbing rough-in on second level. Crew of 4 on site all day.',
      blockers: null,
      digestText: 'Master and hall bath tile work wrapped up and vanities are set. Second-level plumbing rough-in is prepped and ready. No blockers — job is moving clean.',
    },
    {
      jobId: job1.id,
      superName: 'Marcus Delgado',
      reportDate: '2026-04-25',
      workCompleted: 'Interior paint second coat complete on main floor. Trim carpenters started crown molding in living room and dining room. Cabinet delivery rescheduled to May 2nd per supplier.',
      blockers: 'Cabinet supplier pushed delivery 5 days. We adjusted the finish schedule — kitchen rough-in still on track but install will slide to week of May 5th.',
      digestText: 'Main floor paint is done and trim work is underway. Cabinet delivery slipped to May 2nd; kitchen install now targeting May 5th week. Schedule impact is contained — overall completion not yet at risk.',
    },
  ])

  // Job 2 — 3 reports
  await db.insert(schema.siteReports).values([
    {
      jobId: job2.id,
      superName: 'Tony Ferrara',
      reportDate: '2026-04-10',
      workCompleted: 'Steel stud framing complete on floors 2 and 3. MEP subs began rough-in on floor 1. Drywall delivery received and staged in loading dock.',
      blockers: null,
      digestText: 'Framing is done on floors 2 and 3. MEP rough-in started floor 1 and drywall is staged. Good week — job is on pace.',
    },
    {
      jobId: job2.id,
      superName: 'Tony Ferrara',
      reportDate: '2026-04-17',
      workCompleted: 'MEP rough-in continued on floors 1 and 2. Owner walked the space and signed off on floor 1 layout. Ordered additional LVP flooring per finish package confirmation.',
      blockers: null,
      digestText: 'MEP rough-in is progressing on two floors. Owner walk went well — floor 1 layout approved and LVP flooring ordered per confirmed finish package. On schedule.',
    },
    {
      jobId: job2.id,
      superName: 'Tony Ferrara',
      reportDate: '2026-04-24',
      workCompleted: 'Called for MEP inspection on floor 1 south corridor. Inspector flagged conduit routing as non-compliant — requires reroute before drywall can proceed in that zone. Rest of floor 1 and all of floor 2 passed. Drywall started on floors 2 and 3.',
      blockers: 'South corridor MEP failed inspection. Reroute required. MEP contractor submitted Change Order #3 for $14,200. We cannot proceed with drywall in south corridor until CO is approved and reroute is complete. Targeting reroute completion in 5 business days pending approval.',
      digestText: 'MEP inspection flagged a conduit routing issue in the south corridor — reroute required before drywall can close that zone. Floors 2 and 3 drywall are moving. MEP contractor submitted a $14,200 change order; Amir needs to approve before reroute begins. Everything else is on track.',
    },
  ])

  // Job 3 — 1 report
  await db.insert(schema.siteReports).values([
    {
      jobId: job3.id,
      superName: 'Ray Okafor',
      reportDate: '2026-04-22',
      workCompleted: 'Foundation pour complete and cured. Slab inspection passed. Lumber package delivered and staged on site. Framing crew mobilizes Monday.',
      blockers: null,
      digestText: 'Foundation poured, cured, and passed inspection. Lumber is on site. Framing crew starts Monday — job is executing on schedule with 2 days ahead on the timeline.',
    },
  ])

  console.log('Site reports inserted.')

  // Insert tokens
  const ninetyDays = new Date()
  ninetyDays.setDate(ninetyDays.getDate() + 90)

  await db.insert(schema.tokens).values([
    {
      jobId: job1.id,
      tokenValue: 'beachview-report-token',
      purpose: 'site_report',
      expiresAt: ninetyDays,
    },
    {
      jobId: job2.id,
      tokenValue: 'coastal-report-token',
      purpose: 'site_report',
      expiresAt: ninetyDays,
    },
  ])

  console.log('Tokens inserted.')

  // Insert pending decisions
  await db.insert(schema.pendingDecisions).values([
    {
      jobId: job2.id,
      title: 'Approve change order on Coastal Title Co. job — $14,200 for MEP reroute',
      context: 'MEP contractor submitted CO #3 for conduit reroute required after failed inspection. Work cannot proceed until approved.',
      isPending: true,
    },
    {
      jobId: job3.id,
      title: 'Decide on Beltran Cordova Park siding spec — vinyl vs. fiber cement',
      context: 'Beltran requested decision by end of month. Fiber cement adds ~$8,400 but 20-year warranty vs 10-year vinyl.',
      isPending: true,
    },
  ])

  console.log('Pending decisions inserted.')
  console.log('Seed complete.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
