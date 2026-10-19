import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, "../.env.local")
const env = Object.fromEntries(
  fs
    .readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=")
      return [l.slice(0, i), l.slice(i + 1)]
    }),
)

const url = (env.SUPABASE_URL || "").replace(/\/$/, "")
const key = env.SUPABASE_SERVICE_ROLE_KEY
const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
}

async function rest(pathname, init = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 25000)
  try {
    const res = await fetch(`${url}${pathname}`, {
      ...init,
      signal: controller.signal,
      headers: { ...headers, ...(init.headers || {}) },
    })
    const text = await res.text()
    let json
    try {
      json = text ? JSON.parse(text) : null
    } catch {
      json = { raw: text.slice(0, 200) }
    }
    return { status: res.status, json }
  } finally {
    clearTimeout(timer)
  }
}

async function main() {
  if (!url || !key) throw new Error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY")
  console.log("URL", url)

  // Find admin@swypejobs.app
  let page = 1
  let adminUser = null
  while (page <= 10 && !adminUser) {
    const authList = await rest(`/auth/v1/admin/users?page=${page}&per_page=200`)
    const users = authList.json?.users || []
    if (!users.length) break
    adminUser = users.find((u) => (u.email || "").toLowerCase() === "admin@swypejobs.app") || null
    if (users.length < 200) break
    page++
  }

  if (!adminUser) {
    console.log("ADMIN_USER_MISSING")
  } else {
    console.log("ADMIN_USER", adminUser.id, adminUser.email)

    const profile = await rest(`/rest/v1/profiles?id=eq.${adminUser.id}&select=id,full_name,role`)
    console.log("ADMIN_PROFILE_BEFORE", profile.json)

    const currentRole = Array.isArray(profile.json) ? profile.json[0]?.role : null
    if (currentRole !== "admin") {
      const fixed = await rest(`/rest/v1/profiles?id=eq.${adminUser.id}`, {
        method: "PATCH",
        body: JSON.stringify({ role: "admin", full_name: "Swype Super Admin" }),
      })
      console.log("ADMIN_PROFILE_FIXED", fixed.status, fixed.json)
    } else {
      console.log("ADMIN_PROFILE_OK role=admin")
    }

    const staff = await rest(`/rest/v1/platform_staff?user_id=eq.${adminUser.id}&select=*`)
    console.log("STAFF_BEFORE", staff.json)
    if (!Array.isArray(staff.json) || !staff.json.length) {
      const created = await rest("/rest/v1/platform_staff", {
        method: "POST",
        body: JSON.stringify({
          user_id: adminUser.id,
          staff_role: "super_admin",
          modules: ["all"],
        }),
      })
      console.log("STAFF_CREATED", created.status, created.json)
    } else if (staff.json[0].staff_role !== "super_admin") {
      const updated = await rest(`/rest/v1/platform_staff?user_id=eq.${adminUser.id}`, {
        method: "PATCH",
        body: JSON.stringify({ staff_role: "super_admin", modules: ["all"] }),
      })
      console.log("STAFF_UPDATED", updated.status, updated.json)
    } else {
      console.log("STAFF_OK super_admin")
    }
  }

  // Approve all pending recruiters (service role = same as /api/admin/employers)
  const rec = await rest(
    "/rest/v1/recruiter_profiles?select=id,company_name,is_approved,created_at&order=created_at.desc&limit=50",
  )
  if (!Array.isArray(rec.json)) {
    console.log("RECRUITERS_ERROR", rec.status, rec.json)
    process.exit(1)
  }
  console.log(
    "RECRUITERS",
    rec.json.map((r) => ({ id: r.id, company: r.company_name, approved: r.is_approved })),
  )

  const pending = rec.json.filter((r) => !r.is_approved)
  console.log("PENDING_COUNT", pending.length)

  for (const row of pending) {
    const upd = await rest(`/rest/v1/recruiter_profiles?id=eq.${row.id}`, {
      method: "PATCH",
      body: JSON.stringify({ is_approved: true }),
    })
    console.log("APPROVED", row.company_name || row.id, upd.status, upd.json)
  }

  const after = await rest(
    "/rest/v1/recruiter_profiles?select=id,company_name,is_approved&order=created_at.desc&limit=50",
  )
  console.log(
    "AFTER",
    Array.isArray(after.json)
      ? after.json.map((r) => ({ id: r.id, company: r.company_name, approved: r.is_approved }))
      : after.json,
  )
  console.log("DONE")
}

main().catch((e) => {
  console.error(String(e))
  process.exit(1)
})
