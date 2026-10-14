export type PilotStatus = "invited" | "signed" | "approved" | "active" | "revoked";

export type Identity = {
  name: string;
  father: string;
  dob: string;
  mobile: string;
  pemail: string;
  uemail: string;
  uni: string;
  prog: string;
  sid: string;
  addr: string;
  res: string;
  ref: string;
};

export type Consents = {
  required: boolean[];
  optional: boolean[];
};

export type Audit = {
  signedAt: string;
  ip: string;
  userAgent: string;
  documentVersion: string;
  documentHash: string;
  typedName: string;
  nameMismatch: boolean;
  otpConfirmed: true;
  countersignedAt?: string;
  countersignedBy?: string;
};

export type SessionLog = {
  at: string;
  ip: string;
  userAgent: string;
  event: "otp" | "sign" | "approve" | "sign-in" | "password-change";
};

export type PulseAnswer = {
  week: number;
  submittedAt: string;
  device: string;
  hours: string;
  days: string;
  ratings: number[];
  disappointed: string;
  best: string;
  frustrating: string;
  fixFirst: string;
  confused: string;
  expectedMiss: string;
  match: string;
  conversation: string;
  noMatchWhy: string;
  hitBug: string;
  bugScreen: string;
  bugSteps: string;
  bugExpected: string;
  bugTime: string;
  blocker: string;
  nextAsk: string;
  anythingElse: string;
};

export type BugReport = {
  id: string;
  submittedAt: string;
  screen: string;
  steps: string;
  expected: string;
  actual: string;
  time: string;
};

export type Questionnaire = {
  mode: "mid" | "end";
  status: "draft" | "submitted";
  updatedAt: string;
  submittedAt?: string;
  answers: Record<string, string | string[]>;
};

export type JoinInterest = {
  submittedAt: string;
  interest: string;
  capacities: string[];
  other: string;
  why: string;
  skills: string;
  hours: string;
  worthwhile: string;
  know: string;
};

export type Participant = {
  id: string;
  inviteCode: string;
  status: PilotStatus;
  createdAt: string;
  identity?: Identity;
  cnicEnc?: string;
  consents?: Consents;
  audit?: Audit;
  passwordHash?: string;
  tempPasswordEnc?: string;
  credentialsEmailed?: boolean;
  appUserId?: string;
  firstSignInAt?: string;
  otpHash?: string;
  otpExpires?: string;
  otpAttempts?: number;
  logs: SessionLog[];
  pulses: PulseAnswer[];
  bugs: BugReport[];
  questionnaires: Questionnaire[];
  join?: JoinInterest;
};

export type Invite = {
  code: string;
  reusable: boolean;
  participantId: string | null;
  note: string;
};

export type Database = {
  participants: Participant[];
  invites: Invite[];
  nextNumber: number;
};

export type PublicParticipant = {
  id: string;
  status: PilotStatus;
  inviteCode: string;
  identity: Identity | null;
  cnicMasked: string | null;
  consents: Consents | null;
  audit: Audit | null;
  tempPassword: string | null;
  firstSignInAt: string | null;
  pulses: PulseAnswer[];
  bugs: BugReport[];
  questionnaires: Questionnaire[];
  join: JoinInterest | null;
  demo: boolean;
};

export const IDENTITY_FIELDS: { key: keyof Identity; label: string }[] = [
  { key: "name", label: "Full name" },
  { key: "father", label: "Father’s / husband’s name (optional)" },
  { key: "dob", label: "Date of birth (optional)" },
  { key: "mobile", label: "Mobile number" },
  { key: "pemail", label: "Personal email" },
  { key: "uemail", label: "University email (optional)" },
  { key: "uni", label: "University and campus (optional)" },
  { key: "prog", label: "Programme and semester / year (optional)" },
  { key: "sid", label: "Student ID (optional)" },
  { key: "addr", label: "Permanent address (optional)" },
  { key: "res", label: "Current residential address (optional)" },
  { key: "ref", label: "Reference contact (optional)" },
];

export const REQUIRED_CONSENTS = [
  "I have read and understood this form and had the chance to ask questions.",
  "I voluntarily agree to take part in the Pilot.",
  "I consent to swypejobs. collecting and using my identity, account, usage and feedback data as described in section 4.",
  "I consent to the monitoring and protection measures in section 5 (watermarking, access logs, capture detection).",
  "I agree my identity details may be used and shared as described in section 5 to enforce the NDA.",
];

export const OPTIONAL_CONSENTS = [
  "You may record the audio or video of my feedback interviews, for internal note-taking only. Recordings are deleted within 90 days.",
  "You may use short anonymous quotes from my feedback in internal and investor materials.",
  "You may show my profile to participating employers during the Pilot.",
  "You may contact me about future opportunities with swypejobs.",
  "You may name me publicly as a Pilot participant (name and university only).",
];

export const RULES = [
  "Do not take screenshots or screen recordings, or photograph the screen.",
  "Do not share your login or let anyone else use your account.",
  "Do not discuss the pilot or the product on social media, in group chats, or with anyone outside the pilot.",
  "Do not paste anything from the product into other tools, including AI chatbots.",
  "Do not try to scrape, copy, or reverse engineer anything.",
  "Report bugs in words through the feedback form. You do not need images.",
  "Be honest. Critical feedback is the whole point.",
];

export const WEEKS: { week: number; theme: string; missions: string }[] = [
  {
    week: 0,
    theme: "Onboarding",
    missions: "Sign Step 1, receive credentials, sign in, and complete your profile.",
  },
  {
    week: 1,
    theme: "First impressions",
    missions:
      "Build your profile, go through at least 30 cards, note what confuses you, and find a job you would really apply for.",
  },
  {
    week: 2,
    theme: "Matches and chats",
    missions:
      "Aim for a match, start a conversation, test settings and privacy, and complete the mid-pilot questions (sections A to E).",
  },
  {
    week: 3,
    theme: "Stress test",
    missions:
      "Use it the way you would when you are in a hurry, compare it with how you search today, try to break it, and note anything that feels unsafe or untrustworthy.",
  },
  {
    week: 4,
    theme: "Wrap-up",
    missions:
      "Complete the full questionnaire and your interview, including the “would you like to join swypejobs.?” section.",
  },
];
