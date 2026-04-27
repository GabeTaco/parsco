export function buildSiteReportPrompt(params: {
  jobName: string
  clientName: string
  status: string
  superName: string
  reportDate: string
  workCompleted: string
  blockers: string | null
}): string {
  return `You are summarizing a daily site report from a superintendent for the CEO of a general contracting firm. The CEO reads only the digest, not the raw report. Be concise — 2-3 sentences max. Highlight what got done, flag any blockers as concerns, and suggest a follow-up only if genuinely warranted.

Job: ${params.jobName}
Client: ${params.clientName}
Status: ${params.status}
Super: ${params.superName}
Date: ${params.reportDate}

What got done today:
${params.workCompleted}

Blockers:
${params.blockers || 'None reported'}`
}
