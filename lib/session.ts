import { cookies } from "next/headers";
import { isDemo } from "./env";
import { decrypt, maskCnic, signToken, unsignToken } from "./crypto";
import { readDb } from "./store";
import type { Participant, PublicParticipant } from "./types";

const SESSION = "pilot_session";
const ADMIN = "pilot_admin";

export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
}

export function setParticipantCookie(id: string) {
  cookies().set(SESSION, signToken(id), cookieOptions());
}

export function clearParticipantCookie() {
  cookies().set(SESSION, "", { ...cookieOptions(), maxAge: 0 });
}

export function setAdminCookie() {
  cookies().set(ADMIN, signToken("founder"), cookieOptions());
}

export function clearAdminCookie() {
  cookies().set(ADMIN, "", { ...cookieOptions(), maxAge: 0 });
}

export function currentParticipantId() {
  const raw = cookies().get(SESSION)?.value;
  if (!raw) return null;
  const id = unsignToken(raw);
  return id && id.startsWith("SJ-P-") ? id : null;
}

export function isAdmin() {
  const raw = cookies().get(ADMIN)?.value;
  return !!raw && unsignToken(raw) === "founder";
}

export function clientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function toPublic(participant: Participant, revealPassword: boolean): PublicParticipant {
  let cnicMasked: string | null = null;
  if (participant.cnicEnc) {
    try {
      cnicMasked = maskCnic(decrypt(participant.cnicEnc));
    } catch {
      cnicMasked = "XXXXX-XXXXXXX-•";
    }
  }
  const showPassword =
    revealPassword &&
    (participant.status === "approved" || participant.status === "signed") &&
    !!participant.tempPasswordEnc;
  return {
    id: participant.id,
    status: participant.status,
    inviteCode: participant.inviteCode,
    identity: participant.identity ?? null,
    cnicMasked,
    consents: participant.consents ?? null,
    audit: participant.audit ?? null,
    tempPassword: showPassword && participant.tempPasswordEnc ? decrypt(participant.tempPasswordEnc) : null,
    firstSignInAt: participant.firstSignInAt ?? null,
    pulses: participant.pulses,
    bugs: participant.bugs,
    questionnaires: participant.questionnaires,
    join: participant.join ?? null,
    demo: isDemo(),
  };
}

export async function requireParticipant() {
  const id = currentParticipantId();
  if (!id) return null;
  const db = await readDb();
  return db.participants.find((item) => item.id === id) ?? null;
}
