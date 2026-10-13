import { clearParticipantCookie } from "@/lib/session";

export const runtime = "nodejs";

export async function POST() {
  clearParticipantCookie();
  return Response.json({ ok: true });
}
