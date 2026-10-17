import { existsSync, readFileSync } from "fs";
import path from "path";
import type { Database, Participant, PilotAudience } from "./types";

const bucket = "pilot-portal";
const objectPath = "state.json";

function seed(): Database {
  const demo: Participant = {
    id: "SJ-P-001",
    inviteCode: "SJ-DEMO",
    audience: "student",
    status: "invited",
    createdAt: new Date().toISOString(),
    logs: [],
    pulses: [],
    bugs: [],
    questionnaires: [],
  };
  const demoRecruiter: Participant = {
    id: "SJ-P-002",
    inviteCode: "SJ-R-DEMO",
    audience: "recruiter",
    status: "invited",
    createdAt: new Date().toISOString(),
    logs: [],
    pulses: [],
    bugs: [],
    questionnaires: [],
  };
  return {
    nextNumber: 5,
    invites: [
      { code: "SJ-DEMO", reusable: true, participantId: "SJ-P-001", note: "Demo student", audience: "student" },
      { code: "SJ-R-DEMO", reusable: true, participantId: "SJ-P-002", note: "Demo recruiter", audience: "recruiter" },
      { code: "SJ-INVITE-02", reusable: false, participantId: null, note: "Spare student invite", audience: "student" },
      { code: "SJ-INVITE-03", reusable: false, participantId: null, note: "Spare student invite", audience: "student" },
    ],
    participants: [demo, demoRecruiter],
  };
}

function supabaseEnv() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }
  return { url: url.replace(/\/$/, ""), key };
}

function headers(extra?: Record<string, string>) {
  const { key } = supabaseEnv();
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    ...extra,
  };
}

async function ensureBucket() {
  const { url } = supabaseEnv();
  const res = await fetch(`${url}/storage/v1/bucket`, {
    method: "POST",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({ id: bucket, name: bucket, public: false }),
  });
  if (res.ok || res.status === 409) return;
  const body = await res.text();
  if (/already exists/i.test(body)) return;
  throw new Error(`Could not open the pilot storage bucket (${res.status}).`);
}

function localFallback(): Database | null {
  const file = path.join(process.cwd(), "data", "db.json");
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, "utf8")) as Database;
}

async function readRemote(): Promise<Database> {
  const { url } = supabaseEnv();
  // Next caches GET fetch, and Supabase caches the file for an hour. Either one keeps an old
  // state.json, so a new invite or email code is checked against the previous copy and fails.
  const res = await fetch(`${url}/storage/v1/object/${bucket}/${objectPath}?t=${Date.now()}`, {
    headers: headers({ "Cache-Control": "no-cache", Pragma: "no-cache" }),
    cache: "no-store",
  });
  if (res.status === 404 || res.status === 400) {
    const initial = localFallback() ?? seed();
    await writeRemote(initial);
    return initial;
  }
  if (!res.ok) throw new Error(`Could not read pilot records (${res.status}).`);
  return (await res.json()) as Database;
}

async function writeRemote(db: Database) {
  const { url } = supabaseEnv();
  await ensureBucket();
  const res = await fetch(`${url}/storage/v1/object/${bucket}/${objectPath}`, {
    method: "POST",
    headers: headers({
      "Content-Type": "application/json",
      "x-upsert": "true",
      "cache-control": "0",
    }),
    cache: "no-store",
    body: JSON.stringify(db),
  });
  if (!res.ok) throw new Error(`Could not save pilot records (${res.status}).`);
}

let chain: Promise<unknown> = Promise.resolve();

export function updateDb<T>(fn: (db: Database) => T): Promise<T> {
  const run = chain.then(async () => {
    const db = await readRemote();
    const result = fn(db);
    await writeRemote(db);
    return result;
  });
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function readDb() {
  return readRemote();
}

export function blankParticipant(id: string, code: string, audience: PilotAudience = "student"): Participant {
  return {
    id,
    inviteCode: code,
    audience,
    status: "invited",
    createdAt: new Date().toISOString(),
    logs: [],
    pulses: [],
    bugs: [],
    questionnaires: [],
  };
}
