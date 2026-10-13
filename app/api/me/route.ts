import { isDemo } from "@/lib/env";
import { requireParticipant, toPublic } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  const participant = await requireParticipant();
  if (!participant) return Response.json({ participant: null, demo: isDemo() });
  const reveal = participant.status === "approved" && (isDemo() || !participant.credentialsEmailed);
  return Response.json({ participant: toPublic(participant, reveal), demo: isDemo() });
}
