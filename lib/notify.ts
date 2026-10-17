import { pilot } from "./config";

type Mail = { to: string[]; subject: string; text: string };

export function deliveryConfigured() {
  return {
    email: Boolean(process.env.RESEND_API_KEY && process.env.PILOT_EMAIL_FROM),
  };
}

export async function sendMail(mail: Mail) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.PILOT_EMAIL_FROM;
  if (!key || !from) return { sent: false as const, error: "Email is not configured." };
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: mail.to, subject: mail.subject, text: mail.text }),
  });
  if (res.ok) return { sent: true as const, error: "" };
  const body = (await res.json().catch(() => null)) as { message?: string } | null;
  return { sent: false as const, error: body?.message || "Email could not be sent." };
}

export function otpMessage(code: string) {
  return `Your swypejobs. pilot verification code is ${code}. It expires in 10 minutes. If you did not ask for this, ignore it.`;
}

export function credentialsMessage(input: {
  firstName: string;
  email: string;
  password: string;
  portalLink: string;
  inviteLink?: string;
  appLink: string;
  inviteCode: string;
  role?: "student" | "recruiter";
}) {
  const roleLine =
    input.role === "recruiter"
      ? "This login is a recruiter account. After sign-in you should land on company / jobs setup, not the student Discover flow."
      : "This login is a student account. After sign-in you should land on Discover / student profile setup.";
  const inviteLink = input.inviteLink || `${input.portalLink.replace(/\/$/, "")}/portal/invite`;
  return [
    `Hi ${input.firstName},`,
    "",
    "You are approved. Welcome to the pilot.",
    "",
    "The app you will test:",
    input.appLink,
    `Email: ${input.email}`,
    `Temporary password: ${input.password}`,
    roleLine,
    "Sign in, then finish the short profile if it asks. Use this same password until you change it in the app.",
    "",
    input.role === "recruiter" ? "Recruiter pilot overview:" : "Student pilot overview:",
    input.portalLink,
    "",
    "Pilot portal (guide, pulse, and feedback):",
    inviteLink,
    `Invite code: ${input.inviteCode}`,
    "Use the same email. You will set a separate password for the portal.",
    "",
    "Please remember: these accounts are yours alone, do not share them, and do not take screenshots or screen recordings.",
    "",
    `Stuck? Reply here or email ${pilot.contactEmail}.`,
    "",
    `Thank you for helping us build this. ${pilot.founderName}, swypejobs.`,
  ].join("\n");
}
