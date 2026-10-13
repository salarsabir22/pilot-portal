# swypejobs. pilot portal

Private site for the 25 pilot students. Suggested address: `pilot.swypejobs.app`.

Students move through invite, agreements, access, the weekly test guide, and the feedback hub. Step 2 stays locked until a founder countersigns Step 1.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3001

Founder view: http://localhost:3001/admin  
Password: `PILOT_ADMIN_PASSWORD` in `.env.local` (local default `swype-founder`)

Create each student’s invite from Founder view. Codes are single use. Give the code to that student only.

## Make verification real

The 6-digit code is generated on the server, stored only as a hash, and expires in 10 minutes. It is emailed to the personal address and the university address. It is never shown on the page.

1. Create a [Resend](https://resend.com) account and verify the domain you will send from (for example `swypejobs.app`).
2. Put this in `.env.local`:

```env
PILOT_DEMO=false
PILOT_DEMO_OTP=false
RESEND_API_KEY=re_your_key
PILOT_EMAIL_FROM=swypejobs <pilot@swypejobs.app>
```

3. Restart `npm run dev`. Founder view should say verification email is configured.
4. On Step 1, the student enters both email addresses and chooses **Send one-time password**. The same code arrives in both inboxes. They type it in. A wrong code is rejected. After five misses they must request a new one.

Approval emails and the temporary password use the same Resend sender. If that email fails, the temporary password stays in Founder view so you can pass it on once.

CNIC numbers are encrypted, then stored in a private Supabase Storage file named `pilot-portal/state.json` on the same project as the dashboard. Students only see a masked value. On Vercel, set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` next to the other environment variables.

Before real students, also fill the bracketed legal name, dates, and contact details in `lib/config.ts`. After your lawyer confirms clauses 9 and 10, set `documentsFinal` to `true`.

The portal does not replace the product app. Watermark and screenshot controls inside the Android and iPhone apps still belong in that app. This site watermarks the student’s name and participant ID after first sign-in.
