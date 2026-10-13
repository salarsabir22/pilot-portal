import { hashOtp, oneTimeCode } from "@/lib/crypto";
import { deliveryConfigured, otpMessage, sendMail } from "@/lib/notify";
import { clientIp, currentParticipantId } from "@/lib/session";
import { updateDb } from "@/lib/store";

export const runtime = "nodejs";

const emailOk = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export async function POST(request: Request) {
  const id = currentParticipantId();
  if (!id) return Response.json({ error: "Open your invite first." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as {
    pemail?: string;
    uemail?: string;
  } | null;
  const pemail = body?.pemail?.trim() ?? "";
  const uemail = body?.uemail?.trim() ?? "";
  if (!emailOk(pemail) || !emailOk(uemail)) {
    return Response.json(
      { error: "Enter a valid personal email and a valid university email before sending the code." },
      { status: 400 },
    );
  }

  if (!deliveryConfigured().email) {
    return Response.json(
      { error: "Email delivery is not set up yet. Add the Resend key and sender address, then restart the server." },
      { status: 503 },
    );
  }

  const code = oneTimeCode();
  const saved = await updateDb((db) => {
    const participant = db.participants.find((item) => item.id === id);
    if (!participant) return null;
    if (participant.status !== "invited") return { locked: true as const };
    participant.otpHash = hashOtp(code);
    participant.otpExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    participant.otpAttempts = 0;
    participant.logs.push({
      at: new Date().toISOString(),
      ip: clientIp(request),
      userAgent: request.headers.get("user-agent") ?? "",
      event: "otp",
    });
    return { ok: true as const };
  });
  if (!saved) return Response.json({ error: "Invite not found." }, { status: 404 });
  if ("locked" in saved) return Response.json({ error: "This agreement is already signed." }, { status: 400 });

  const mailed = await sendMail({
    to: Array.from(new Set([pemail, uemail])),
    subject: "Your swypejobs. pilot verification code",
    text: otpMessage(code),
  });

  if (!mailed.sent) {
    await updateDb((db) => {
      const participant = db.participants.find((item) => item.id === id);
      if (participant && participant.status === "invited") {
        participant.otpHash = undefined;
        participant.otpExpires = undefined;
      }
    });
    return Response.json({ error: `The code could not be emailed. ${mailed.error}` }, { status: 502 });
  }

  return Response.json({ sent: true, emailed: true });
}
