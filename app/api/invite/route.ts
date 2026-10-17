import { isDemo } from "@/lib/env";
import { blankParticipant, updateDb } from "@/lib/store";
import { setParticipantCookie, toPublic } from "@/lib/session";
import { audienceOf, type Participant } from "@/lib/types";

export const runtime = "nodejs";

function openSession(participant: Participant) {
  if (participant.status === "revoked") {
    return Response.json({ error: "This invite is no longer active." }, { status: 403 });
  }
  if (participant.status === "active") {
    const email = participant.identity?.uemail || participant.identity?.pemail || "";
    const hint = email.replace(/(^.).*(@.*$)/, "$1•••$2");
    return Response.json({ needsPassword: true, emailHint: hint });
  }
  setParticipantCookie(participant.id);
  return Response.json({
    participant: toPublic(participant, isDemo()),
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { code?: string } | null;
  const code = (body?.code ?? "").replace(/\s+/g, "").toUpperCase();
  if (!code) return Response.json({ error: "Enter your invite code." }, { status: 400 });

  const result = await updateDb((db) => {
    const invite = db.invites.find((item) => item.code.toUpperCase() === code);
    if (!invite) return { error: "That code is not recognised. Check the invite and try again." as const };
    if (invite.participantId) {
      const existing = db.participants.find((item) => item.id === invite.participantId);
      if (!existing) return { error: "This invite is not set up yet." as const };
      return { participant: existing };
    }
    const id = `SJ-P-${String(db.nextNumber).padStart(3, "0")}`;
    db.nextNumber += 1;
    const participant = blankParticipant(id, invite.code, audienceOf(invite.audience));
    db.participants.push(participant);
    invite.participantId = id;
    return { participant };
  });

  if ("error" in result) return Response.json({ error: result.error }, { status: 400 });
  return openSession(result.participant);
}
