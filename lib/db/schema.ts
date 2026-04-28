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

// ── Estimate Module ──────────────────────────────────────────────────────────

export const estimates = pgTable('estimates', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').notNull().references(() => jobs.id),
  name: text('name').notNull().default('Initial Estimate'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const estimateItems = pgTable('estimate_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  estimateId: uuid('estimate_id').notNull().references(() => estimates.id, { onDelete: 'cascade' }),
  csiDivision: integer('csi_division').notNull(),
  itemNumber: text('item_number'),
  description: text('description').notNull(),
  qty: numeric('qty').default('0'),
  unit: text('unit'),
  laborUnit: numeric('labor_unit').default('0'),
  laborTotal: numeric('labor_total').default('0'),
  materialUnit: numeric('material_unit').default('0'),
  materialTotal: numeric('material_total').default('0'),
  subUnit: numeric('sub_unit').default('0'),
  subTotal: numeric('sub_total').default('0'),
  equipUnit: numeric('equip_unit').default('0'),
  equipTotal: numeric('equip_total').default('0'),
  lineTotal: numeric('line_total').default('0'),
  bic: text('bic'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ── Project Modules ───────────────────────────────────────────────────────────

export const rfiStatusEnum = pgEnum('rfi_status', ['open', 'answered', 'closed'])

export const rfis = pgTable('rfis', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').notNull().references(() => jobs.id),
  rfiNumber: integer('rfi_number').notNull(),
  subject: text('subject').notNull(),
  question: text('question').notNull(),
  drawingRef: text('drawing_ref'),
  sentTo: text('sent_to'),
  submittedBy: text('submitted_by'),
  status: rfiStatusEnum('status').notNull().default('open'),
  answer: text('answer'),
  answeredBy: text('answered_by'),
  dueDate: date('due_date'),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  answeredAt: timestamp('answered_at'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const submittalStatusEnum = pgEnum('submittal_status', ['pending', 'submitted', 'approved', 'approved_as_noted', 'revise_resubmit', 'rejected'])

export const submittals = pgTable('submittals', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').notNull().references(() => jobs.id),
  submittalNumber: text('submittal_number').notNull(),
  specSection: text('spec_section'),
  description: text('description').notNull(),
  submittedBy: text('submitted_by'),
  reviewedBy: text('reviewed_by'),
  status: submittalStatusEnum('status').notNull().default('pending'),
  revisionNo: integer('revision_no').default(0).notNull(),
  reviewerNotes: text('reviewer_notes'),
  dueDate: date('due_date'),
  submittedAt: timestamp('submitted_at'),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const activityStatusEnum = pgEnum('activity_status', ['not_started', 'in_progress', 'complete', 'delayed'])

export const scheduleActivities = pgTable('schedule_activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').notNull().references(() => jobs.id),
  title: text('title').notNull(),
  csiDivision: integer('csi_division'),
  startDate: date('start_date'),
  endDate: date('end_date'),
  durationDays: integer('duration_days'),
  predecessorId: uuid('predecessor_id').references((): AnyPgColumn => scheduleActivities.id),
  percentComplete: integer('percent_complete').default(0).notNull(),
  status: activityStatusEnum('status').notNull().default('not_started'),
  notes: text('notes'),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const invoiceStatusEnum = pgEnum('invoice_status', ['pending', 'approved', 'paid', 'disputed'])

export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').notNull().references(() => jobs.id),
  invoiceNumber: text('invoice_number'),
  vendor: text('vendor').notNull(),
  description: text('description'),
  csiDivision: integer('csi_division'),
  amount: numeric('amount').notNull(),
  invoiceDate: date('invoice_date').notNull(),
  dueDate: date('due_date'),
  paidDate: date('paid_date'),
  status: invoiceStatusEnum('status').notNull().default('pending'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
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
