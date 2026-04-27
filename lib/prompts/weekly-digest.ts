export function buildWeeklyDigestPrompt(params: {
  activeJobs: Array<{ name: string; status: string; percentComplete: number; daysVariance: number }>
  reportsGrouped: Array<{ job: string; reports: (string | null)[] }>
  weeklyIssues: Array<{ title: string; flagColor: string; description: string }>
}): string {
  return `You are writing a weekly executive briefing for the CEO of a general contracting firm. He reads this on Sunday night. Be direct, no fluff.

Active jobs and their state:
${JSON.stringify(params.activeJobs, null, 2)}

Site reports from this week:
${JSON.stringify(params.reportsGrouped, null, 2)}

New or updated issues this week:
${JSON.stringify(params.weeklyIssues, null, 2)}

Write a "What changed this week" section. Group by job. One bulleted line per change. No preamble. Bold any flag-worthy items.`
}
