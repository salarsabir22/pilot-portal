export function appLoginUrl() {
  return (process.env.NEXT_PUBLIC_PILOT_APP_URL || process.env.PILOT_APP_URL || "https://dashboard.swypejobs.app/login").replace(
    /\/$/,
    "",
  );
}

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
  recruiterRewards:
    "early access when we launch hiring tools, a participation certificate, a LinkedIn recommendation from the founders, priority support when you hire on swypejobs., and swag",
  /** B is the fixed sum. A is proved loss only. */
  breachOption: "B" as "A" | "B" | "both",
  fixedSumPkr: "150,000",
  disputeOption: "both" as "A" | "B" | "both",
  /** Flip to true after the lawyer signs off, to hide the draft banner. */
  documentsFinal: false,
  documentVersion: "NDA v1.0-draft + Consent v1.0-draft",
  recruiterDocumentVersion: "NDA-R v1.0-draft + Consent-R v1.0-draft",
  agreementRefPrefix: "SJ-NDA",
  consentRefPrefix: "SJ-CF",
};

export function documentVersionFor(audience?: "student" | "recruiter" | null) {
  return audience === "recruiter" ? pilot.recruiterDocumentVersion : pilot.documentVersion;
}

export function rewardsFor(audience?: "student" | "recruiter" | null) {
  return audience === "recruiter" ? pilot.recruiterRewards : pilot.rewards;
}

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
