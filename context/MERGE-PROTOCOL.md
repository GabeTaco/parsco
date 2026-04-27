# Merge Protocol — Parsco GC

Use this when new data arrives: job updates, financial data, CEO notes, benchmarks, decisions.

## Steps

1. **Identify** what kind of data it is:
   - Job update → update DB + add/update context/jobs/[slug].md
   - Financial benchmark → context/benchmarks/
   - Decision → context/decisions/YYYY-MM-DD--[topic].md
   - Company profile change → context/company/profile.md
   - New KPI target or flag threshold → CANONICAL.json (requires CEO approval)

2. **Validate** against CANONICAL.json — if the new data conflicts with existing benchmarks, flag it. Do not silently overwrite.

3. **Classify** per manifest.json rules:
   - Is this locked data? Get CEO approval before changing.
   - Is this dynamic? Update directly.
   - Is this static-research? Add with date context.

4. **Update INDEX.md** if a new file was added.

5. **Update CLAUDE.md** if architecture or project state changed.

6. **Commit** with a descriptive message.

## Job Context File Format (context/jobs/[slug].md)
```markdown
# [Job Name]

## Overview
Client, address, contract value, status.

## Scope
What the job entails.

## Key Relationships
GC subs, inspectors, owner rep.

## Known Risks
What could go wrong.

## Decisions Made
Running log of major decisions and approvals.
```
