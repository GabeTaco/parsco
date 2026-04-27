import { pgTable, uuid, text, numeric, integer, boolean, timestamp, date, jsonb, pgEnum } from 'drizzle-orm/pg-core'

export const jobStatusEnum = pgEnum('job_status', ['bidding', 'active', 'punch_list', 'complete'])
export const flagColorEnum = pgEnum('flag_color', ['red', 'yellow', 'green'])

export const jobs = pgTable('jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  clientName: text('client_name').notNull(),
  siteAddress: text('site_address').notNull(),
  contractValue: numeric('contract_value').notNull(),
  currentSpend: numeric('current_spend').default('0').notNull(),
  status: jobStatusEnum('status').notNull().default('active'),
  startDate: date('start_date').notNull(),
  targetCompletionDate: date('target_completion_date').notNull(),
  percentComplete: integer('percent_complete').default(0).notNull(),
  daysVariance: integer('days_variance').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const issues = pgTable('issues', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').notNull().references(() => jobs.id),
  title: text('title').notNull(),
  flagColor: flagColorEnum('flag_color').notNull(),
  description: text('description').notNull(),
  isOpen: boolean('is_open').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const siteReports = pgTable('site_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').notNull().references(() => jobs.id),
  superName: text('super_name').notNull(),
  reportDate: date('report_date').notNull(),
  workCompleted: text('work_completed').notNull(),
  blockers: text('blockers'),
  rawSubmissionData: jsonb('raw_submission_data'),
  digestText: text('digest_text'),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
})

export const tokens = pgTable('tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').notNull().references(() => jobs.id),
  tokenValue: text('token_value').notNull().unique(),
  purpose: text('purpose').notNull().default('site_report'),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const pendingDecisions = pgTable('pending_decisions', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').references(() => jobs.id),
  title: text('title').notNull(),
  context: text('context').notNull(),
  isPending: boolean('is_pending').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
