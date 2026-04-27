# Context Index — Parsco GC

Master navigation. Read this first in any new session.

## System Files
| File | Purpose | Type |
|------|---------|------|
| CANONICAL.json | GC benchmarks, KPI targets, issue severity definitions | locked |
| INDEX.md (this file) | Navigation map | dynamic |
| manifest.json | File classification | locked |
| MERGE-PROTOCOL.md | How new data enters the system | locked |

## Company
| File | Purpose | Type |
|------|---------|------|
| company/profile.md | Company overview, leadership structure, markets | dynamic |

## Jobs
Per-job context files live here as jobs are onboarded.
Format: jobs/[job-slug].md
Each file: scope, client relationship, known risks, key decisions.

## Benchmarks
| File | Purpose | Type |
|------|---------|------|
| benchmarks/industry-margins.md | GC margin benchmarks by project type | static-research |
| benchmarks/inspection-rates.md | Inspection pass/fail rates by trade | static-research |

## Decisions
Persistent decision log. Format: decisions/YYYY-MM-DD--[topic].md
Each decision: context, options considered, decision made, who approved.

## How Data Flows
1. CEO inputs (job updates, site reports) → Neon DB via app
2. AI prompts pull from CANONICAL.json for benchmark context
3. Job context files supplement AI prompts for complex analysis
4. Decisions are logged here for audit trail
5. Weekly digest pulls DB data + CANONICAL.json thresholds to generate briefing
