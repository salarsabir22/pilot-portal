function supabaseEnv() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase is not configured.");
  return { url: url.replace(/\/$/, ""), key };
}

export function appLoginUrl() {
  return (process.env.PILOT_APP_URL || "https://dashboard.swypejobs.app/login").replace(/\/$/, "");
}

type AuthUser = { id?: string; email?: string; user_metadata?: Record<string, unknown> };

async function authAdmin(path: string, method: string, body?: unknown) {
  const { url, key } = supabaseEnv();
  const res = await fetch(`${url}/auth/v1/admin${path}`, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const payload = (await res.json().catch(() => null)) as
    | (AuthUser & { users?: AuthUser[]; msg?: string; message?: string; error_description?: string })
    | null;
  return { ok: res.ok, payload };
}

function authError(payload: { msg?: string; message?: string; error_description?: string } | null) {
  return payload?.msg || payload?.message || payload?.error_description || "Could not create the app account.";
}

async function upsertProfile(id: string, fullName: string) {
  const { url, key } = supabaseEnv();
  await fetch(`${url}/rest/v1/profiles?on_conflict=id`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({ id, role: "student", full_name: fullName }),
    cache: "no-store",
  });
}

export async function ensureStudentAccount(input: { email: string; password: string; fullName: string }) {
  const metadata = { full_name: input.fullName, role: "student" };
  const created = await authAdmin("/users", "POST", {
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: metadata,
  });

  let userId = created.payload?.id;
  if (!created.ok) {
    const message = authError(created.payload);
    if (!/already|exists|registered/i.test(message)) return { error: message };
    const listed = await authAdmin(`/users?filter=${encodeURIComponent(input.email)}`, "GET");
    const match = listed.payload?.users?.find((item) => item.email?.toLowerCase() === input.email.toLowerCase());
    if (!match?.id) return { error: message };
    const updated = await authAdmin(`/users/${match.id}`, "PUT", {
      password: input.password,
      email_confirm: true,
      user_metadata: { ...match.user_metadata, ...metadata },
    });
    if (!updated.ok) return { error: "That email already has an app account, and the password could not be set." };
    userId = updated.payload?.id || match.id;
  }

  if (!userId) return { error: "The app account was created without an id." };
  await upsertProfile(userId, input.fullName);
  return { id: userId };
}

export async function disableStudentAccount(userId: string) {
  await authAdmin(`/users/${userId}`, "PUT", { ban_duration: "876000h" });
}
