import { pilot } from "@/lib/config";
import { isDemo } from "@/lib/env";
import { encrypt, hashOtp, sha256 } from "@/lib/crypto";
import { documentPlain } from "@/lib/documents";
import { clientIp, currentParticipantId, toPublic } from "@/lib/session";
import { updateDb } from "@/lib/store";
import { REQUIRED_CONSENTS, type Consents, type Identity } from "@/lib/types";
import { namesMatch, validateIdentity } from "@/lib/validate";

export const runtime = "nodejs";

type Body = {
  identity?: Partial<Identity> & { cnic?: string };
  adult?: boolean;
  consents?: Consents;
  typedName?: string;
  otp?: string;
  acknowledgeMismatch?: boolean;
};

export async function POST(request: Request) {
  const id = currentParticipantId();
  if (!id) return Response.json({ error: "Open your invite first." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as Body | null;
  const checked = validateIdentity(body?.identity ?? {}, !!body?.adult);
  if (!checked.ok) return Response.json({ error: checked.error }, { status: 400 });

  const required = body?.consents?.required ?? [];
  const optional = body?.consents?.optional ?? [];
  if (required.length !== REQUIRED_CONSENTS.length || required.some((item) => !item)) {
    return Response.json({ error: "Tick every required consent box." }, { status: 400 });
  }
  if (optional.length !== 5 || optional.some((item) => typeof item !== "boolean")) {
    return Response.json({ error: "Save each optional consent as yes or no." }, { status: 400 });
  }

  const typedName = body?.typedName?.trim() ?? "";
  if (!typedName) return Response.json({ error: "Type your full name to sign." }, { status: 400 });
  const mismatch = !namesMatch(typedName, checked.identity.name);
  if (mismatch && !body?.acknowledgeMismatch) {
    return Response.json(
      {
        error: "The name you typed does not match the CNIC name. Check it, or confirm you still want to sign.",
        code: "NAME_MISMATCH",
      },
      { status: 400 },
    );
  }
  const otp = (body?.otp ?? "").replace(/\D/g, "");
  if (!/^\d{6}$/.test(otp)) return Response.json({ error: "Enter the 6-digit code." }, { status: 400 });

  const result = await updateDb((db) => {
    const participant = db.participants.find((item) => item.id === id);
    if (!participant) return { error: "Invite not found.", status: 404 };
    if (participant.status !== "invited") return { error: "This agreement is already signed.", status: 400 };
    if (!participant.otpHash || !participant.otpExpires) {
      return { error: "Send the one-time password first.", status: 400 };
    }
    if (new Date(participant.otpExpires).getTime() < Date.now()) {
      return { error: "That code has expired. Send a new one.", status: 400 };
    }
    participant.otpAttempts = (participant.otpAttempts ?? 0) + 1;
    if (participant.otpAttempts > 5) return { error: "Too many attempts. Send a new code.", status: 400 };
    if (participant.otpHash !== hashOtp(otp)) return { error: "That code is wrong. Check it and try again.", status: 400 };

    const now = new Date().toISOString();
    participant.identity = checked.identity;
    participant.cnicEnc = checked.cnic ? encrypt(checked.cnic) : undefined;
    participant.consents = { required, optional };
    participant.audit = {
      signedAt: now,
      ip: clientIp(request),
      userAgent: request.headers.get("user-agent") ?? "",
      documentVersion: pilot.documentVersion,
      documentHash: sha256(documentPlain(participant.id)),
      typedName,
      nameMismatch: mismatch,
      otpConfirmed: true,
    };
    participant.status = "signed";
    participant.otpHash = undefined;
    participant.otpExpires = undefined;
    participant.otpAttempts = 0;
    participant.logs.push({
      at: now,
      ip: clientIp(request),
      userAgent: request.headers.get("user-agent") ?? "",
      event: "sign",
    });
    return { participant };
  });

  if ("error" in result) return Response.json({ error: result.error }, { status: result.status });
  return Response.json({ participant: toPublic(result.participant, isDemo()) });
}
