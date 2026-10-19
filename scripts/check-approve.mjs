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
const service = env.SUPABASE_SERVICE_ROLE_KEY
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

const serviceHeaders = {
  apikey: service,
  Authorization: `Bearer ${service}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
}

async function main() {
  const rec = await fetch(
    `${url}/rest/v1/recruiter_profiles?select=id,company_name,is_approved,created_at&order=created_at.desc&limit=10`,
    { headers: serviceHeaders },
  )
  const recruiters = await rec.json()
  console.log("RECRUITERS", JSON.stringify(recruiters, null, 2))

  const target = Array.isArray(recruiters) ? recruiters.find((r) => !r.is_approved) || recruiters[0] : null
  if (!target) {
    console.log("No recruiter profiles found")
    return
  }

  // Simulate browser client (anon, no user JWT): update should affect 0 rows under RLS
  if (anon) {
    const anonRes = await fetch(`${url}/rest/v1/recruiter_profiles?id=eq.${target.id}`, {
      method: "PATCH",
      headers: {
        apikey: anon,
        Authorization: `Bearer ${anon}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({ is_approved: true }),
    })
    const anonBody = await anonRes.text()
    console.log("ANON_UPDATE_STATUS", anonRes.status)
    console.log("ANON_UPDATE_BODY", anonBody)
  }

  // Service role can update
  const svcRes = await fetch(`${url}/rest/v1/recruiter_profiles?id=eq.${target.id}`, {
    method: "PATCH",
    headers: serviceHeaders,
    body: JSON.stringify({ is_approved: true }),
  })
  console.log("SERVICE_UPDATE", svcRes.status, await svcRes.text())

  const check = await fetch(
    `${url}/rest/v1/recruiter_profiles?id=eq.${target.id}&select=id,company_name,is_approved`,
    { headers: serviceHeaders },
  )
  console.log("AFTER", JSON.stringify(await check.json(), null, 2))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
