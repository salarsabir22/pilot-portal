export const pilot = {
  brand: "swypejobs.",
  companyLegalName: "Swype Jobs",
  founderName: "Shozab Jawwad",
  contactName: "Shozab Jawwad",
  contactEmail: "hello@swypejobs.app",
  responseTime: "within 24 hours",
  place: "Karachi, Pakistan",
  confidentialityYears: 3,
  identityRetentionYears: 2,
  otherDataMonths: 12,
  recordingRetentionDays: 90,
  weeklyHours: 5,
  testingWeeks: 4,
  approvalHours: 24,
  pulseDeadline: "Sunday 9 pm",
  interviewMinutes: 45,
  rewards:
    "early access when we launch, a participation certificate, a LinkedIn recommendation from the founders, priority introductions to employers, and swag",
  /** B is the fixed sum. A is proved loss only. */
  breachOption: "B" as "A" | "B" | "both",
  fixedSumPkr: "150,000",
  disputeOption: "both" as "A" | "B" | "both",
  /** Flip to true after the lawyer signs off, to hide the draft banner. */
  documentsFinal: false,
  documentVersion: "NDA v1.0-draft + Consent v1.0-draft",
  agreementRefPrefix: "SJ-NDA",
  consentRefPrefix: "SJ-CF",
};

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Karachi",
});

export function pilotDates(from = new Date()) {
  const end = new Date(from.getTime() + (pilot.testingWeeks + 2) * 7 * 24 * 60 * 60 * 1000);
  return { start: dateFormat.format(from), end: dateFormat.format(end) };
}
