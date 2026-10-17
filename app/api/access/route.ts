import { verifyPassword } from "@/lib/crypto";
import { clientIp, currentParticipantId, setParticipantCookie, toPublic } from "@/lib/session";
import { readDb, updateDb } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    action?: "activate" | "login";
    rules?: boolean;
    email?: string;
    password?: string;
  } | null;

  if (body?.action === "login") {
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";
    const db = await readDb();
    const participant = db.participants.find((item) => {
      const emails = [item.identity?.pemail, item.identity?.uemail].map((value) => value?.toLowerCase());
      return emails.includes(email);
    });
    if (!participant || participant.status !== "active" || !participant.passwordHash || !verifyPassword(password, participant.passwordHash)) {
      return Response.json({ error: "That email or password is not recognised." }, { status: 401 });
    }
    setParticipantCookie(participant.id);
    return Response.json({ participant: toPublic(participant, false) });
  }

  const id = currentParticipantId();
  if (!id) return Response.json({ error: "Open your invite first." }, { status: 401 });
  if (!body?.rules) return Response.json({ error: "Confirm you have read the rules." }, { status: 400 });

  const result = await updateDb((db) => {
    const participant = db.participants.find((item) => item.id === id);
    if (!participant) return { error: "Invite not found.", status: 404 };
    if (participant.status !== "approved") {
      return { error: "Your account is not ready to sign in yet.", status: 400 };
    }
    if (!participant.passwordHash) {
      return { error: "Your app credentials are not ready yet. Ask a founder to re-approve.", status: 400 };
    }
    const now = new Date().toISOString();
    // Keep the issued temp password — no portal password change step.
    participant.status = "active";
    participant.firstSignInAt = now;
    participant.logs.push({
      at: now,
      ip: clientIp(request),
      userAgent: request.headers.get("user-agent") ?? "",
      event: "sign-in",
    });
    return { participant };
  });

  if ("error" in result) return Response.json({ error: result.error }, { status: result.status });
  return Response.json({ participant: toPublic(result.participant, false) });
}
