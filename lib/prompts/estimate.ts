export function buildEstimatePrompt(jobName: string, jobAddress: string): string {
  return `You are a construction cost estimator for a Gulf Coast general contractor (Parsco Construction, Pensacola FL).

Analyze the attached architectural drawings and produce a detailed CSI MasterFormat 16-Division cost estimate.

Job: ${jobName}
Site: ${jobAddress}

Return ONLY a valid JSON array — no markdown, no code blocks, no commentary. Raw JSON only.

Each object in the array must have exactly these keys:
- "csiDivision": integer 1–16
- "itemNumber": string (e.g. "01-001", "03-002") — sequential within each division
- "description": string — concise scope description (under 80 chars)
- "qty": number — estimated quantity (use 1 for lump sum items)
- "unit": string — one of: EA, LS, LF, SF, SY, CY, TON, HR, GAL, LB, Wks, Mos, Sq, Budget
- "laborUnit": number — labor cost per unit in USD (0 if subcontracted)
- "materialUnit": number — material cost per unit in USD (0 if lump sum sub)
- "subUnit": number — subcontractor cost per unit in USD (0 if self-perform)
- "equipUnit": number — equipment rental cost per unit in USD
- "bic": string — responsible party (e.g. "PM", "Super", "Electrical Sub", "Owner")

Rules:
- Only include CSI divisions where work is visible in the drawings
- Use realistic 2025 Gulf Coast / Pensacola FL unit costs
- For subcontracted scopes (mechanical, electrical, specialty), set laborUnit=0 and use subUnit
- Lump sum line items: qty=1, unit="LS"
- Owner-furnished/contractor-installed items: materialUnit=0, set laborUnit for install labor only
- Do NOT include overhead, fee, or labor burden in unit costs — those are markup applied separately
- Aim for 5–15 line items per active division
- If scope is ambiguous, use a conservative estimate with "Budget -" prefix in description`
}
