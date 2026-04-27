import { pgTable, uuid, text, numeric, integer, boolean, timestamp, date, jsonb, pgEnum, AnyPgColumn } from 'drizzle-orm/pg-core'

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

export const bidStatusEnum = pgEnum('bid_status', ['draft', 'submitted', 'reviewed', 'awarded', 'rejected'])

export const bids = pgTable('bids', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').notNull().references(() => jobs.id),
  subcontractorName: text('subcontractor_name').notNull(),
  subcontractorEmail: text('subcontractor_email'),
  trade: text('trade').notNull(),
  bidDate: date('bid_date').notNull(),
  validUntil: date('valid_until'),
  totalAmount: numeric('total_amount').notNull(),
  status: bidStatusEnum('status').notNull().default('submitted'),
  inclusions: text('inclusions'),
  exclusions: text('exclusions'),
  qualifications: text('qualifications'),
  rawSubmissionData: jsonb('raw_submission_data'),
  reviewNotes: text('review_notes'),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const bidLineItems = pgTable('bid_line_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  bidId: uuid('bid_id').notNull().references(() => bids.id, { onDelete: 'cascade' }),
  sortOrder: integer('sort_order').notNull(),
  description: text('description').notNull(),
  quantity: numeric('quantity'),
  unit: text('unit'),
  unitPrice: numeric('unit_price'),
  totalPrice: numeric('total_price').notNull(),
  notes: text('notes'),
})

export const pendingDecisions = pgTable('pending_decisions', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').references(() => jobs.id),
  title: text('title').notNull(),
  context: text('context').notNull(),
  isPending: boolean('is_pending').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ── Command Center ──────────────────────────────────────────────────────────

export const askStatusEnum = pgEnum('ask_status', ['pending', 'sent', 'opened', 'responded', 'expired', 'escalated'])
export const deliveryChannelEnum = pgEnum('delivery_channel', ['email', 'sms', 'both'])

export const contacts = pgTable('contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  company: text('company'),
  email: text('email'),
  phone: text('phone'),
  role: text('role'),
  jobId: uuid('job_id').references(() => jobs.id),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const asks = pgTable('asks', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').references(() => jobs.id),
  contactId: uuid('contact_id').references(() => contacts.id),
  parentAskId: uuid('parent_ask_id').references((): AnyPgColumn => asks.id),
  title: text('title').notNull(),
  body: text('body'),
  formSchemaId: text('form_schema_id'),
  deliveryChannel: deliveryChannelEnum('delivery_channel').notNull().default('email'),
  recipientEmail: text('recipient_email'),
  recipientPhone: text('recipient_phone'),
  tokenValue: text('token_value').unique(),
  status: askStatusEnum('status').notNull().default('pending'),
  dueDate: date('due_date'),
  sentAt: timestamp('sent_at'),
  openedAt: timestamp('opened_at'),
  respondedAt: timestamp('responded_at'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const askResponses = pgTable('ask_responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  askId: uuid('ask_id').notNull().references(() => asks.id),
  responseData: jsonb('response_data').notNull(),
  respondedAt: timestamp('responded_at').defaultNow().notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
})

export const activityLog = pgTable('activity_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').references(() => jobs.id),
  askId: uuid('ask_id').references(() => asks.id),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  action: text('action').notNull(),
  actor: text('actor'),
  meta: jsonb('meta'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
