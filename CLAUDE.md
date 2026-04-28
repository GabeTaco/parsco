# Parsco GC — Project Context

## What This Is
Construction CEO dashboard for Amir (client demo). Internal operations management tool for a general contracting company — KPI tracking, job oversight, site report digests, weekly executive briefing.

**Demo:** 2026-04-28 at 2:30pm via Teams screen-share.

## Stack
- Next.js 16 (App Router) + TypeScript
- Neon PostgreSQL (direct endpoint, sslmode=require, NO channel_binding=require)
- Drizzle ORM (schema at lib/db/schema.ts)
- Anthropic API (claude-sonnet-4-6) — site report digests + weekly briefing
- Vercel deployment
- PIN auth via env var (REPO_PIN=7392) + iron-session cookie

## Auth
- PIN gate at /login → sets parsco_session cookie (30-day)
- Protected: /jobs, /digest, /admin
- Public: /login, /form/site-report/[token]
- Middleware: middleware.ts

## Routes
| Route | Type | Purpose |
|-------|------|---------|
| /login | public | PIN entry |
| /jobs | protected | Job grid |
| /jobs/[id] | protected | Job detail (with Estimate/Schedule/Billings/RFIs/Submittals/Bids links) |
| /jobs/[id]/estimate | protected | CSI 16 inline-editable estimate + PDF→AI generation |
| /jobs/[id]/schedule | protected | Activity list grouped by status |
| /jobs/[id]/billings | protected | Invoice CRUD, pending→approved→paid flow |
| /jobs/[id]/rfis | protected | RFI log, auto-numbered, answer/close flow |
| /jobs/[id]/submittals | protected | Submittal log, full status flow |
| /jobs/[id]/bids | protected | Bid management |
| /digest | protected | Weekly executive briefing (AI) |
| /admin/tokens | protected | Token management |
| /form/site-report/[token] | public | Superintendent form (mobile) |
| /cmd | protected | Command Center portal (10-module grid + KPI strip) |
| /f/[token] | public | Generic ask/form renderer |

## Database (Neon)
Tables: jobs, issues, site_reports, tokens, pending_decisions, asks, ask_responses, contacts, activity_log, estimates, estimate_items, rfis, submittals, schedule_activities, invoices
Schema: lib/db/schema.ts
Migrations: drizzle/ directory
Seed: scripts/seed.ts (run with DATABASE_URL='...' npx tsx scripts/seed.ts)

## Environment Variables
DATABASE_URL — Neon direct endpoint, sslmode=require only
ANTHROPIC_API_KEY — claude-sonnet-4-6
REPO_PIN — 4-digit string
SESSION_SECRET — iron-session signing key

## Design System
CSS variables in app/globals.css. Utility classes in same file.
Colors: --bg #f4f5f7, --text #1c2638, --muted #6b7689, --navy #2c3e6b (primary), --border #d8dde5, --card #ffffff
Typography: Inter (UI) + Cormorant Garamond (serif headers/digest) — both loaded from Google Fonts
DO NOT use inline style props for anything covered by a CSS class.

## Context Architecture
context/CANONICAL.json — GC business benchmarks and KPI targets (AI reasoning source)
context/INDEX.md — Navigation map for all context files
context/manifest.json — File classification
context/company/ — Company profile and structure
context/jobs/ — Per-job context files (added as jobs are onboarded)
context/benchmarks/ — Industry benchmarks
context/decisions/ — Decision log

## Seed Data (Demo)
4 jobs: Beachview Remodel, Pensacola Tech Park Buildout, Cordova Park Residence, Simpson Residence (bidding)
Simpson Residence: 45+ real estimate line items from Amir's Excel (CSI Div 1–16), real subs: Davis Marine, ICF Strong, Salvador, Mobile Lumber, Swift, Cox Pools, etc.
Tokens: beachview-report-token, coastal-report-token
Pending decisions: 2 pre-loaded

## Development Rules
1. No inline styles for anything with a CSS class. Use className.
2. Every new page linked from nav before pushing.
3. QA + push when work is done — don't wait to be asked.
4. Update CLAUDE.md if architecture or project state changes.
5. Neon: never add channel_binding=require to DATABASE_URL.
6. Model: claude-sonnet-4-6 (not 4-5, not latest).
7. CANONICAL.json is the source for all GC benchmark numbers used in AI prompts.

## Anthropic Integration
Site report prompt: lib/prompts/site-report.ts
Weekly digest prompt: lib/prompts/weekly-digest.ts
Both prompts reference context/CANONICAL.json benchmarks where relevant.

---

## Session Log

### 2026-04-27
- **Built:** Full app scaffold — Next.js 16 App Router, Neon PostgreSQL, Drizzle ORM, Vercel deploy. PIN auth (cookie-based). Job grid + job detail. Site report token flow. Weekly AI digest. Admin links page. Command Center portal (/cmd) with 10-module grid and live KPI strip. Ask system schema (asks, askResponses, contacts, activityLog). Generic form renderer at /f/[token].
- **Built (PM modules):** Estimate (CSI 16, inline-editable, PDF→Claude AI generation), Schedule, Billings (invoice CRUD), RFI Log, Submittals — all scoped to /jobs/[id]. Simpson Residence seeded with real estimate data from Amir's Excel.

### 2026-04-28
- Demo day: 2:30pm Teams screen-share with Amir.
- All tables migrated (drizzle-kit push), seed re-run with 4 jobs.
- TypeScript clean, committed and pushed.
