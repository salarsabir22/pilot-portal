import { serializeParticipant } from "@/lib/admin-serialize";
import { isAdmin } from "@/lib/session";
import { readDb } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> | { id: string } }) {
  if (!isAdmin()) return Response.json({ error: "Founder sign-in required." }, { status: 401 });

  const params = await Promise.resolve(context.params);
  const id = decodeURIComponent(params.id || "").trim();
  if (!id) return Response.json({ error: "Participant id required." }, { status: 400 });

  const db = await readDb();
  const item = db.participants.find((row) => row.id === id);
  if (!item) return Response.json({ error: "Participant not found." }, { status: 404 });

  return Response.json({ participant: serializeParticipant(item) });
}
