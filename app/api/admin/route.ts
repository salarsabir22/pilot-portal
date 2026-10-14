import { randomBytes } from "crypto";
import { appLoginUrl, disableStudentAccount, ensureStudentAccount } from "@/lib/app-account";
import { pilot } from "@/lib/config";
import { decrypt, encrypt, hashPassword, safeEqualString, tempPassword } from "@/lib/crypto";
import { credentialsMessage, deliveryConfigured, sendMail } from "@/lib/notify";
import { clearAdminCookie, clientIp, isAdmin, setAdminCookie } from "@/lib/session";
import { blankParticipant, readDb, updateDb } from "@/lib/store";

export const runtime = "nodejs";

function guard() {
  if (!isAdmin()) return Response.json({ error: "Founder sign-in required." }, { status: 401 });
  return null;
}

export async function GET() {
  const denied = guard();
  if (denied) return denied;
  const db = await readDb();
  return Response.json({
    participants: db.participants.map((item) => ({
      id: item.id,
      status: item.status,
      inviteCode: item.inviteCode,
      createdAt: item.createdAt,
      identity: item.identity ?? null,
      cnic: item.cnicEnc ? decrypt(item.cnicEnc) : null,
      consents: item.consents ?? null,
      audit: item.audit ?? null,
      tempPassword: item.tempPasswordEnc ? decrypt(item.tempPasswordEnc) : null,
      credentialsEmailed: !!item.credentialsEmailed,
      firstSignInAt: item.firstSignInAt ?? null,
      pulses: item.pulses,
      bugs: item.bugs,
      questionnaires: item.questionnaires,
      join: item.join ?? null,
      logs: item.logs,
    })),
    invites: db.invites,
    delivery: deliveryConfigured(),
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    action?: string;
    password?: string;
    id?: string;
    note?: string;
  } | null;

  if (body?.action === "login") {
    const expected = process.env.PILOT_ADMIN_PASSWORD || "";
    if (!expected || !body.password || !safeEqualString(body.password, expected)) {
      return Response.json({ error: "That founder password is not recognised." }, { status: 401 });
    }
    setAdminCookie();
    return Response.json({ ok: true });
  }

  if (body?.action === "logout") {
    clearAdminCookie();
    return Response.json({ ok: true });
  }

  const denied = guard();
  if (denied) return denied;

  if (body?.action === "approve") {
    const password = tempPassword();
    const origin = new URL(request.url).origin;
    const current = await readDb();
    const pending = current.participants.find((item) => item.id === body.id);
    if (!pending) return Response.json({ error: "Participant not found." }, { status: 404 });
    if (pending.status !== "signed" || !pending.audit || !pending.identity) {
      return Response.json({ error: "This student has not signed yet." }, { status: 400 });
    }
    const email = pending.identity.pemail || pending.identity.uemail;
    if (!email) return Response.json({ error: "This student has no email address." }, { status: 400 });
    const account = await ensureStudentAccount({
      email,
      password,
      fullName: pending.identity.name || email,
    });
    if ("error" in account) return Response.json({ error: account.error }, { status: 502 });
    const result = await updateDb((db) => {
      const participant = db.participants.find((item) => item.id === body.id);
      if (!participant || !participant.audit) return { error: "Participant not found.", status: 404 };
      const now = new Date().toISOString();
      participant.audit.countersignedAt = now;
      participant.audit.countersignedBy = pilot.founderName;
      participant.passwordHash = hashPassword(password);
      participant.tempPasswordEnc = encrypt(password);
      participant.appUserId = account.id;
      participant.status = "approved";
      participant.logs.push({
        at: now,
        ip: clientIp(request),
        userAgent: request.headers.get("user-agent") ?? "",
        event: "approve",
      });
      return { participant };
    });
    if ("error" in result) return Response.json({ error: result.error }, { status: result.status });
    const person = result.participant;
    const university = person.identity?.uemail?.trim();
    const recipients = Array.from(new Set([email, university].filter((item): item is string => Boolean(item))));
    const appLogin = appLoginUrl();
    const mailed = await sendMail({
      to: recipients,
      subject: "Your swypejobs. pilot access",
      text: credentialsMessage({
        firstName: person.identity?.name.split(" ")[0] || "there",
        email,
        password,
        portalLink: `${origin}/portal/invite`,
        appLink: appLogin,
        inviteCode: person.inviteCode,
      }),
    });
    if (mailed.sent) {
      await updateDb((db) => {
        const participant = db.participants.find((item) => item.id === person.id);
        if (participant) participant.credentialsEmailed = true;
      });
    }
    return Response.json({ ok: true, tempPassword: password, emailed: mailed.sent, email, appLogin });
  }

  if (body?.action === "create-invite") {
    const code = `SJ-${randomBytes(3).toString("hex").toUpperCase()}`;
    await updateDb((db) => {
      db.invites.push({ code, reusable: false, participantId: null, note: body.note?.trim() || "Created by founder" });
    });
    return Response.json({ code });
  }

  if (body?.action === "revoke") {
    const current = await readDb();
    const existing = current.participants.find((item) => item.id === body.id);
    await updateDb((db) => {
      const participant = db.participants.find((item) => item.id === body.id);
      if (participant) participant.status = "revoked";
    });
    if (existing?.appUserId) await disableStudentAccount(existing.appUserId);
    return Response.json({ ok: true });
  }

  if (body?.action === "reset-demo") {
    await updateDb((db) => {
      db.participants = db.participants.filter((item) => item.id !== "SJ-P-001");
      db.participants.unshift(blankParticipant("SJ-P-001", "SJ-DEMO"));
      const invite = db.invites.find((item) => item.code === "SJ-DEMO");
      if (invite) invite.participantId = "SJ-P-001";
    });
    return Response.json({ ok: true });
  }

  return Response.json({ error: "Unknown action." }, { status: 400 });
}
