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
  await db.delete(schema.estimateItems)
  await db.delete(schema.estimates)
  await db.delete(schema.rfis)
  await db.delete(schema.submittals)
  await db.delete(schema.scheduleActivities)
  await db.delete(schema.invoices)
  await db.delete(schema.pendingDecisions)
  await db.delete(schema.tokens)
  await db.delete(schema.siteReports)
  await db.delete(schema.issues)
  await db.delete(schema.bids)
  await db.delete(schema.bidLineItems)
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

  const [job4] = await db.insert(schema.jobs).values({
    name: 'New Construction — Simpson Residence',
    clientName: 'Mr. & Mrs. Stephen Simpson',
    siteAddress: '11655 Chanticleer Dr, Pensacola FL',
    contractValue: '1970978',
    currentSpend: '0',
    status: 'bidding',
    startDate: '2026-06-01',
    targetCompletionDate: '2027-06-01',
    percentComplete: 0,
    daysVariance: 0,
  }).returning()

  console.log('Jobs inserted:', job1.id, job2.id, job3.id, job4.id)

  // Simpson Residence Preliminary Estimate
  const [simpsonEstimate] = await db.insert(schema.estimates).values({
    jobId: job4.id,
    name: 'Preliminary Estimate — 1.5.26',
  }).returning()

  await db.insert(schema.estimateItems).values([
    // Division 1 — General Requirements
    { estimateId: simpsonEstimate.id, csiDivision: 1, itemNumber: '01-001', description: 'Project Manager', qty: '52', unit: 'Wks', laborUnit: '2000', laborTotal: '104000', materialUnit: '0', materialTotal: '0', subUnit: '0', subTotal: '0', equipUnit: '0', equipTotal: '0', lineTotal: '104000', bic: 'PM', sortOrder: 0 },
    { estimateId: simpsonEstimate.id, csiDivision: 1, itemNumber: '01-002', description: 'Superintendent', qty: '52', unit: 'Wks', laborUnit: '1500', laborTotal: '78000', materialUnit: '0', materialTotal: '0', subUnit: '0', subTotal: '0', equipUnit: '0', equipTotal: '0', lineTotal: '78000', bic: 'PM', sortOrder: 1 },
    { estimateId: simpsonEstimate.id, csiDivision: 1, itemNumber: '01-003', description: 'Fuel & Travel', qty: '52', unit: 'Wks', laborUnit: '0', laborTotal: '0', materialUnit: '100', materialTotal: '5200', subUnit: '0', subTotal: '0', equipUnit: '0', equipTotal: '0', lineTotal: '5200', bic: 'Super', sortOrder: 2 },
    { estimateId: simpsonEstimate.id, csiDivision: 1, itemNumber: '01-004', description: 'Building Layout', qty: '6001.6', unit: 'SF', laborUnit: '0', laborTotal: '0', materialUnit: '0', materialTotal: '0', subUnit: '0.45', subTotal: '2701', equipUnit: '0', equipTotal: '0', lineTotal: '2701', bic: 'Super', sortOrder: 3 },
    { estimateId: simpsonEstimate.id, csiDivision: 1, itemNumber: '01-005', description: 'Small Tools & Supplies', qty: '1', unit: 'LS', laborUnit: '0', laborTotal: '0', materialUnit: '1000', materialTotal: '1000', subUnit: '0', subTotal: '0', equipUnit: '0', equipTotal: '0', lineTotal: '1000', bic: 'Super', sortOrder: 4 },
    { estimateId: simpsonEstimate.id, csiDivision: 1, itemNumber: '01-006', description: 'Dumpsters', qty: '10', unit: 'EA', laborUnit: '0', laborTotal: '0', materialUnit: '0', materialTotal: '0', subUnit: '0', subTotal: '0', equipUnit: '2000', equipTotal: '20000', lineTotal: '20000', bic: 'Super', sortOrder: 5 },
    { estimateId: simpsonEstimate.id, csiDivision: 1, itemNumber: '01-007', description: 'Portable Toilets', qty: '12', unit: 'Mos', laborUnit: '0', laborTotal: '0', materialUnit: '0', materialTotal: '0', subUnit: '0', subTotal: '0', equipUnit: '135', equipTotal: '1620', lineTotal: '1620', bic: 'Super', sortOrder: 6 },
    { estimateId: simpsonEstimate.id, csiDivision: 1, itemNumber: '01-008', description: 'Weekly Cleanup', qty: '52', unit: 'Wks', laborUnit: '0', laborTotal: '0', materialUnit: '0', materialTotal: '0', subUnit: '80', subTotal: '4160', equipUnit: '0', equipTotal: '0', lineTotal: '4160', bic: 'Super', sortOrder: 7 },
    { estimateId: simpsonEstimate.id, csiDivision: 1, itemNumber: '01-009', description: 'Final Clean Up', qty: '6001.6', unit: 'SF', laborUnit: '0', laborTotal: '0', materialUnit: '0', materialTotal: '0', subUnit: '0.65', subTotal: '3901', equipUnit: '0', equipTotal: '0', lineTotal: '3901', bic: 'Super', sortOrder: 8 },
    { estimateId: simpsonEstimate.id, csiDivision: 1, itemNumber: '01-010', description: 'Permit', qty: '1', unit: 'LS', laborUnit: '0', laborTotal: '0', materialUnit: '2500', materialTotal: '2500', subUnit: '0', subTotal: '0', equipUnit: '0', equipTotal: '0', lineTotal: '2500', bic: 'PM', sortOrder: 9 },
    // Division 2 — Site Construction
    { estimateId: simpsonEstimate.id, csiDivision: 2, itemNumber: '02-001', description: 'Fine Grade Building Pad', qty: '3667.23', unit: 'SF', laborUnit: '0', laborTotal: '0', materialUnit: '0', materialTotal: '0', subUnit: '1.88', subTotal: '6894', equipUnit: '0', equipTotal: '0', lineTotal: '6894', bic: 'Wyatt', sortOrder: 0 },
    { estimateId: simpsonEstimate.id, csiDivision: 2, itemNumber: '02-002', description: "Pilings 14\"×14\" (Davis Marine)", qty: '1', unit: 'LS', laborUnit: '0', laborTotal: '0', materialUnit: '0', materialTotal: '0', subUnit: '103500', subTotal: '103500', equipUnit: '0', equipTotal: '0', lineTotal: '103500', bic: 'Davis Marine', sortOrder: 1 },
    { estimateId: simpsonEstimate.id, csiDivision: 2, itemNumber: '02-003', description: 'Landscaping / Irrigation', qty: '1', unit: 'LS', laborUnit: '0', laborTotal: '0', materialUnit: '0', materialTotal: '0', subUnit: '0', subTotal: '0', equipUnit: '0', equipTotal: '0', lineTotal: '0', bic: 'Wyatt', sortOrder: 2 },
    // Division 3 — Concrete
    { estimateId: simpsonEstimate.id, csiDivision: 3, itemNumber: '03-001', description: 'ICF Main Level & Floor above (ICF Strong)', qty: '1', unit: 'Budget', laborUnit: '0', laborTotal: '0', materialUnit: '0', materialTotal: '0', subUnit: '143250', subTotal: '143250', equipUnit: '0', equipTotal: '0', lineTotal: '143250', bic: 'ICF Strong', sortOrder: 0 },
    { estimateId: simpsonEstimate.id, csiDivision: 3, itemNumber: '03-002', description: 'ICF Deck & Supporting Beams (ICF Strong)', qty: '1', unit: 'Budget', laborUnit: '0', laborTotal: '0', materialUnit: '0', materialTotal: '0', subUnit: '187862', subTotal: '187862', equipUnit: '0', equipTotal: '0', lineTotal: '187862', bic: 'ICF Strong', sortOrder: 1 },
    { estimateId: simpsonEstimate.id, csiDivision: 3, itemNumber: '03-003', description: "Slab 4\" thick", qty: '26.1', unit: 'CY', laborUnit: '0', laborTotal: '0', materialUnit: '0', materialTotal: '0', subUnit: '625', subTotal: '16313', equipUnit: '0', equipTotal: '0', lineTotal: '16313', bic: 'Levi', sortOrder: 2 },
    { estimateId: simpsonEstimate.id, csiDivision: 3, itemNumber: '03-004', description: 'Site Concrete — Driveway 4"', qty: '20', unit: 'CY', laborUnit: '0', laborTotal: '0', materialUnit: '0', materialTotal: '0', subUnit: '625', subTotal: '12500', equipUnit: '0', equipTotal: '0', lineTotal: '12500', bic: 'Levi', sortOrder: 3 },
    // Division 5 — Metals
    { estimateId: simpsonEstimate.id, csiDivision: 5, itemNumber: '05-001', description: 'Cable Railings', qty: '142.9', unit: 'LF', laborUnit: '0', laborTotal: '0', materialUnit: '0', materialTotal: '0', subUnit: '150', subTotal: '21435', equipUnit: '0', equipTotal: '0', lineTotal: '21435', bic: 'Fluid', sortOrder: 0 },
    // Division 6 — Wood & Plastics
    { estimateId: simpsonEstimate.id, csiDivision: 6, itemNumber: '06-001', description: 'Framing Labor (Salvador)', qty: '6001.6', unit: 'SF', laborUnit: '0', laborTotal: '0', materialUnit: '0', materialTotal: '0', subUnit: '5', subTotal: '30008', equipUnit: '0', equipTotal: '0', lineTotal: '30008', bic: 'Salvador', sortOrder: 0 },
    { estimateId: simpsonEstimate.id, csiDivision: 6, itemNumber: '06-002', description: 'Wall Framing Material (Mobile Lumber)', qty: '1', unit: 'LS', laborUnit: '0', laborTotal: '0', materialUnit: '0', materialTotal: '0', subUnit: '3250', subTotal: '3250', equipUnit: '0', equipTotal: '0', lineTotal: '3250', bic: 'Wyatt', sortOrder: 1 },
    { estimateId: simpsonEstimate.id, csiDivision: 6, itemNumber: '06-003', description: 'Roof & Floor Trusses (Swift)', qty: '1', unit: 'LS', laborUnit: '0', laborTotal: '0', materialUnit: '0', materialTotal: '0', subUnit: '16035', subTotal: '16035', equipUnit: '0', equipTotal: '0', lineTotal: '16035', bic: 'Swift', sortOrder: 2 },
    { estimateId: simpsonEstimate.id, csiDivision: 6, itemNumber: '06-004', description: 'Wood Base', qty: '1135.8', unit: 'LF', laborUnit: '2.5', laborTotal: '2839', materialUnit: '1.25', materialTotal: '1420', subUnit: '0', subTotal: '0', equipUnit: '0', equipTotal: '0', lineTotal: '4259', bic: 'Super', sortOrder: 3 },
    { estimateId: simpsonEstimate.id, csiDivision: 6, itemNumber: '06-005', description: 'Composite Decking — Balconies', qty: '746', unit: 'SF', laborUnit: '3.5', laborTotal: '2611', materialUnit: '9', materialTotal: '6714', subUnit: '0', subTotal: '0', equipUnit: '0', equipTotal: '0', lineTotal: '9325', bic: 'Wyatt', sortOrder: 4 },
    { estimateId: simpsonEstimate.id, csiDivision: 6, itemNumber: '06-006', description: 'Handrail For Stairs', qty: '100', unit: 'LF', laborUnit: '0', laborTotal: '0', materialUnit: '0', materialTotal: '0', subUnit: '50', subTotal: '5000', equipUnit: '0', equipTotal: '0', lineTotal: '5000', bic: 'Super', sortOrder: 5 },
    // Division 7 — Thermal & Moisture Protection
    { estimateId: simpsonEstimate.id, csiDivision: 7, itemNumber: '07-001', description: 'Roofing (Guardian Roofing)', qty: '1', unit: 'LS', laborUnit: '0', laborTotal: '0', materialUnit: '0', materialTotal: '0', subUnit: '60850', subTotal: '60850', equipUnit: '0', equipTotal: '0', lineTotal: '60850', bic: 'Guardian', sortOrder: 0 },
    { estimateId: simpsonEstimate.id, csiDivision: 7, itemNumber: '07-002', description: 'Spray Foam Insulation', qty: '3923.5', unit: 'SF', laborUnit: '0', laborTotal: '0', materialUnit: '0', materialTotal: '0', subUnit: '2.5', subTotal: '9809', equipUnit: '0', equipTotal: '0', lineTotal: '9809', bic: 'SHS', sortOrder: 1 },
    { estimateId: simpsonEstimate.id, csiDivision: 7, itemNumber: '07-003', description: 'Board & Batten and Soffit', qty: '1', unit: 'LS', laborUnit: '0', laborTotal: '0', materialUnit: '0', materialTotal: '0', subUnit: '12281', subTotal: '12281', equipUnit: '0', equipTotal: '0', lineTotal: '12281', bic: 'Wyatt', sortOrder: 2 },
    { estimateId: simpsonEstimate.id, csiDivision: 7, itemNumber: '07-004', description: 'Soffit at Porches', qty: '1', unit: 'LS', laborUnit: '0', laborTotal: '0', materialUnit: '0', materialTotal: '0', subUnit: '12377', subTotal: '12377', equipUnit: '0', equipTotal: '0', lineTotal: '12377', bic: 'Wyatt', sortOrder: 3 },
    // Division 8 — Doors & Windows
    { estimateId: simpsonEstimate.id, csiDivision: 8, itemNumber: '08-001', description: 'Windows (Anderson)', qty: '1', unit: 'LS', laborUnit: '0', laborTotal: '0', materialUnit: '58025', materialTotal: '58025', subUnit: '0', subTotal: '0', equipUnit: '0', equipTotal: '0', lineTotal: '58025', bic: 'Vendors', sortOrder: 0 },
    { estimateId: simpsonEstimate.id, csiDivision: 8, itemNumber: '08-002', description: 'Garage Doors', qty: '1', unit: 'LS', laborUnit: '0', laborTotal: '0', materialUnit: '0', materialTotal: '0', subUnit: '31054', subTotal: '31054', equipUnit: '0', equipTotal: '0', lineTotal: '31054', bic: 'Precision', sortOrder: 1 },
    { estimateId: simpsonEstimate.id, csiDivision: 8, itemNumber: '08-003', description: 'Exterior Doors', qty: '1', unit: 'LS', laborUnit: '0', laborTotal: '0', materialUnit: '0', materialTotal: '0', subUnit: '0', subTotal: '0', equipUnit: '0', equipTotal: '0', lineTotal: '0', bic: 'Vendors', sortOrder: 2 },
    { estimateId: simpsonEstimate.id, csiDivision: 8, itemNumber: '08-004', description: 'Interior Doors', qty: '1', unit: 'LS', laborUnit: '0', laborTotal: '0', materialUnit: '0', materialTotal: '0', subUnit: '0', subTotal: '0', equipUnit: '0', equipTotal: '0', lineTotal: '0', bic: 'Vendors', sortOrder: 3 },
    // Division 9 — Finishes
    { estimateId: simpsonEstimate.id, csiDivision: 9, itemNumber: '09-001', description: 'Sheetrock Hang & Finish — Walls', qty: '308', unit: 'Boards', laborUnit: '22.08', laborTotal: '6801', materialUnit: '79.2', materialTotal: '24394', subUnit: '0', subTotal: '0', equipUnit: '0', equipTotal: '0', lineTotal: '31195', bic: 'Buddy Pittman', sortOrder: 0 },
    { estimateId: simpsonEstimate.id, csiDivision: 9, itemNumber: '09-002', description: 'Sheetrock Hang & Finish — Ceilings', qty: '117.5', unit: 'Boards', laborUnit: '22.08', laborTotal: '2594', materialUnit: '79.2', materialTotal: '9306', subUnit: '0', subTotal: '0', equipUnit: '0', equipTotal: '0', lineTotal: '11900', bic: 'Buddy Pittman', sortOrder: 1 },
    { estimateId: simpsonEstimate.id, csiDivision: 9, itemNumber: '09-003', description: 'Paint — Sheetrock Walls', qty: '14795', unit: 'SF', laborUnit: '0', laborTotal: '0', materialUnit: '0', materialTotal: '0', subUnit: '1.25', subTotal: '18494', equipUnit: '0', equipTotal: '0', lineTotal: '18494', bic: 'Peterson', sortOrder: 2 },
    { estimateId: simpsonEstimate.id, csiDivision: 9, itemNumber: '09-004', description: 'Paint — Stucco & Hardie', qty: '5910', unit: 'SF', laborUnit: '0', laborTotal: '0', materialUnit: '0', materialTotal: '0', subUnit: '5', subTotal: '29550', equipUnit: '0', equipTotal: '0', lineTotal: '29550', bic: 'Peterson', sortOrder: 3 },
    { estimateId: simpsonEstimate.id, csiDivision: 9, itemNumber: '09-005', description: 'LVP — Owner Furnished, Contractor Installed', qty: '3385', unit: 'SF', laborUnit: '0', laborTotal: '0', materialUnit: '0', materialTotal: '0', subUnit: '2.15', subTotal: '7278', equipUnit: '0', equipTotal: '0', lineTotal: '7278', bic: 'Super', sortOrder: 4 },
    { estimateId: simpsonEstimate.id, csiDivision: 9, itemNumber: '09-006', description: 'Floor Tile', qty: '345', unit: 'SF', laborUnit: '0', laborTotal: '0', materialUnit: '0', materialTotal: '0', subUnit: '15', subTotal: '5175', equipUnit: '0', equipTotal: '0', lineTotal: '5175', bic: 'Sub', sortOrder: 5 },
    { estimateId: simpsonEstimate.id, csiDivision: 9, itemNumber: '09-007', description: 'Wall Tile — Bathrooms', qty: '843', unit: 'SF', laborUnit: '0', laborTotal: '0', materialUnit: '0', materialTotal: '0', subUnit: '20', subTotal: '16860', equipUnit: '0', equipTotal: '0', lineTotal: '16860', bic: 'Sub', sortOrder: 6 },
    // Division 10 — Specialties
    { estimateId: simpsonEstimate.id, csiDivision: 10, itemNumber: '10-001', description: 'Fireplace — Allowance', qty: '1', unit: 'Allow', laborUnit: '0', laborTotal: '0', materialUnit: '5000', materialTotal: '5000', subUnit: '0', subTotal: '0', equipUnit: '0', equipTotal: '0', lineTotal: '5000', bic: 'Simpsons', sortOrder: 0 },
    { estimateId: simpsonEstimate.id, csiDivision: 10, itemNumber: '10-002', description: 'Bath Accessories', qty: '4', unit: 'EA', laborUnit: '320', laborTotal: '1280', materialUnit: '1500', materialTotal: '6000', subUnit: '0', subTotal: '0', equipUnit: '0', equipTotal: '0', lineTotal: '7280', bic: 'Super', sortOrder: 1 },
    // Division 13 — Special Construction
    { estimateId: simpsonEstimate.id, csiDivision: 13, itemNumber: '13-001', description: 'Gunnite Swimming Pool (Cox Pools)', qty: '1', unit: 'LS', laborUnit: '0', laborTotal: '0', materialUnit: '0', materialTotal: '0', subUnit: '126715', subTotal: '126715', equipUnit: '0', equipTotal: '0', lineTotal: '126715', bic: 'Cox Pools', sortOrder: 0 },
    // Division 14 — Conveying Systems
    { estimateId: simpsonEstimate.id, csiDivision: 14, itemNumber: '14-001', description: 'Elevator — 3 Stop (Panhandle)', qty: '1', unit: 'LS', laborUnit: '0', laborTotal: '0', materialUnit: '0', materialTotal: '0', subUnit: '27500', subTotal: '27500', equipUnit: '0', equipTotal: '0', lineTotal: '27500', bic: 'Bradley Dortch', sortOrder: 0 },
    // Division 15 — Mechanical
    { estimateId: simpsonEstimate.id, csiDivision: 15, itemNumber: '15-001', description: 'HVAC — 15 Tons (NWFL)', qty: '15', unit: 'Tons', laborUnit: '0', laborTotal: '0', materialUnit: '0', materialTotal: '0', subUnit: '2500', subTotal: '37500', equipUnit: '0', equipTotal: '0', lineTotal: '37500', bic: 'NWFL', sortOrder: 0 },
    { estimateId: simpsonEstimate.id, csiDivision: 15, itemNumber: '15-002', description: 'Plumbing', qty: '5000', unit: 'SF', laborUnit: '0', laborTotal: '0', materialUnit: '0', materialTotal: '0', subUnit: '7.5', subTotal: '37500', equipUnit: '0', equipTotal: '0', lineTotal: '37500', bic: 'Sub', sortOrder: 1 },
    // Division 16 — Electrical
    { estimateId: simpsonEstimate.id, csiDivision: 16, itemNumber: '16-001', description: 'Electrical (Johnson)', qty: '1', unit: 'LS', laborUnit: '0', laborTotal: '0', materialUnit: '0', materialTotal: '0', subUnit: '28150', subTotal: '28150', equipUnit: '0', equipTotal: '0', lineTotal: '28150', bic: 'Johnson', sortOrder: 0 },
    { estimateId: simpsonEstimate.id, csiDivision: 16, itemNumber: '16-002', description: 'Generator (Johnson)', qty: '1', unit: 'LS', laborUnit: '0', laborTotal: '0', materialUnit: '0', materialTotal: '0', subUnit: '18804', subTotal: '18804', equipUnit: '0', equipTotal: '0', lineTotal: '18804', bic: 'Johnson', sortOrder: 1 },
    { estimateId: simpsonEstimate.id, csiDivision: 16, itemNumber: '16-003', description: 'Low Voltage / Technology', qty: '6001', unit: 'SF', laborUnit: '0', laborTotal: '0', materialUnit: '5.5', materialTotal: '33006', subUnit: '0', subTotal: '0', equipUnit: '0', equipTotal: '0', lineTotal: '33006', bic: 'Total Connect', sortOrder: 2 },
  ])

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
