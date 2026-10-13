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

export function credentialsMessage(firstName: string, email: string, password: string, link: string) {
  return [
    `Hi ${firstName},`,
    "",
    "You are approved. Welcome to the pilot.",
    "",
    `Your sign-in: ${link}`,
    `Username: ${email}`,
    `Temporary password: ${password} (you will be asked to change it)`,
    "",
    "Please remember: this account is yours alone, do not share it, and do not take screenshots or screen recordings. Your name will appear as a watermark inside the app, and your activity is logged, as described in the consent form you signed.",
    "",
    `Stuck? Reply here or message ${pilot.whatsapp}.`,
    "",
    `Thank you for helping us build this. ${pilot.founderName}, swypejobs.`,
  ].join("\n");
}
