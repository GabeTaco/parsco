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
| /jobs/[id] | protected | Job detail |
| /digest | protected | Weekly executive briefing (AI) |
| /admin/tokens | protected | Token management |
| /form/site-report/[token] | public | Superintendent form (mobile) |

## Database (Neon)
Tables: jobs, issues, site_reports, tokens, pending_decisions
Schema: lib/db/schema.ts
Migrations: drizzle/ directory
Seed: scripts/seed.ts (run with npx tsx scripts/seed.ts)

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
3 jobs pre-loaded: Beachview Remodel, Pensacola Tech Park Buildout, Cordova Park Residence
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
- **Built:** Full app scaffold — Next.js 16 App Router, Neon PostgreSQL, Drizzle ORM, Vercel deploy. PIN auth (cookie-based, no iron-session). Job grid + job detail views (schedule, budget, open issues, recent activity). Site report token flow: admin creates link → super submits form on mobile → AI processes submission → report appears in job detail. Weekly AI digest with on-demand Generate button. Admin "Site Report Links" page with Copy Link, QR code toggle, and Revoke per link.
- **Changed:** Removed iron-session (Edge Runtime incompatibility). Moved auth gate to `app/(authenticated)/layout.tsx` route group pattern. Moved AI digest from page-load blocking to on-demand client component. Applied real Parsco design system: navy/cool-gray palette eyedropped from logo and pars-co.net, Cormorant Garamond + Inter fonts, real logo, address sub-bar, "AF" avatar. Renamed "tokens" → "links" throughout admin UI.
- **Pending:** Confirm `ANTHROPIC_API_KEY` is set in Vercel (not placeholder). Full demo run-through before 2:30 PM: login → jobs → job detail → digest generate → site report submission.
