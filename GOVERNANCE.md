# Parsco GC — Governance

## Product Intent

Parsco GC is a construction CEO dashboard built as a client demo for Amir (ParsCo Construction, Pensacola FL). It is an internal ops tool for a general contracting company: KPI tracking, job oversight, AI-powered site report digests, and a weekly executive briefing.

**Demo:** April 28, 2026 at 2:30 PM via Teams screen-share.

**Success criteria:** Amir sees a live, polished tool he could hand to his team tomorrow.

---

## Demo Success Criteria

- [ ] Jobs grid loads with real seed data (3 jobs, correct figures)
- [ ] Job detail shows schedule, budget, open issues, recent activity
- [ ] Site report link flow works end-to-end: create link → super submits form → report appears in job detail
- [ ] Weekly digest generates via Anthropic (Generate Digest button returns real AI output)
- [ ] Design feels professional, not prototype-y — real logo, real address, brand-matched colors

---

## Global Decision Log

| Date | Decision | Rationale | Cascades To |
|------|----------|-----------|-------------|
| 2026-04-27 | PIN auth over OAuth | Simplicity for demo; no user management overhead | `app/api/auth/login/route.ts`, `lib/require-auth.ts`, `REPO_PIN` env var |
| 2026-04-27 | Navy/oxblood palette → navy only | Eyedropped from real Parsco logo and pars-co.net; oxblood was a placeholder | `app/globals.css`, all component files |
| 2026-04-27 | `claude-sonnet-4-6` locked as model | Stability; avoid silent upgrades changing digest output before demo | `app/api/digest/route.ts`, `app/api/site-report/route.ts` |
| 2026-04-27 | `CANONICAL.json` as single source for GC benchmarks | All AI prompts must reason from the same numbers; prevents drift | `context/CANONICAL.json`, `lib/prompts/site-report.ts`, `lib/prompts/weekly-digest.ts` |
| 2026-04-27 | Iron-session removed; plain `Set-Cookie` via Next.js `cookies()` | Iron-session uses Node.js APIs incompatible with Edge Runtime; was causing `__dirname` 500s | `lib/require-auth.ts`, `app/api/auth/login/route.ts`, `app/(authenticated)/layout.tsx` |
| 2026-04-27 | Auth gate in route group layout, not per-page | Single `requireAuth()` in `app/(authenticated)/layout.tsx` covers all protected routes; per-page checks get forgotten | `app/(authenticated)/layout.tsx` |
| 2026-04-27 | AI digest on-demand (button), not on page load | Page loaded slowly when Anthropic call blocked render; executives don't want to wait | `app/(authenticated)/digest/DigestGenerator.tsx`, `app/api/digest/route.ts` |
| 2026-04-27 | "Tokens" renamed to "Links" throughout admin UI | "Token" is dev vocabulary; supers and PMs talk in jobs, links, and sites | `app/(authenticated)/admin/tokens/`, `app/api/tokens/` |
| 2026-04-27 | Revoke = delete token row | No `isActive` flag in schema; deletion is simpler and sufficient for demo | `app/api/tokens/[id]/route.ts` |
| 2026-04-27 | Vercel framework preset must be "Next.js" not "Other" | Repo was empty on initial import; Vercel defaulted to "Other" and returned 404 on all routes | Vercel project settings |

---

## Cascade Map

When you change one of these, update everything in the same column.

| What changed | Must also update |
|---|---|
| GC benchmarks / KPI thresholds | `context/CANONICAL.json` → `lib/prompts/site-report.ts` → `lib/prompts/weekly-digest.ts` |
| Design tokens (colors, type, spacing) | `app/globals.css` → verify every component that references the changed token |
| New route added | `CLAUDE.md` routes table + `components/Nav.tsx` (if it's user-facing) |
| DB schema change | `lib/db/schema.ts` → `CLAUDE.md` tables list → `scripts/seed.ts` → run `drizzle-kit push` |
| Auth mechanism change | `lib/require-auth.ts` → `app/api/auth/login/route.ts` → `app/(authenticated)/layout.tsx` → `CLAUDE.md` auth section |
| AI model version change | `app/api/digest/route.ts` → `app/api/site-report/route.ts` → `CLAUDE.md` stack + Anthropic section |
| New prompt written | Add to `lib/prompts/` → reference `CANONICAL.json` for any benchmark numbers → update `CLAUDE.md` Anthropic section |
| Seed data changes | `scripts/seed.ts` → `CLAUDE.md` seed data section → re-run seed on Neon |
| Env var added or renamed | `.env.example` (if it exists) → `CLAUDE.md` env vars section → Vercel project settings |
