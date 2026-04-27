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
Colors: --bg #fbf8f2, --text #1a1512, --muted #8a7e74, --accent #6b1f1a (oxblood), --border #d8cfc2, --card #ffffff
Typography: Inter (UI) + Georgia (serif headers/digest)
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
