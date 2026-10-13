"use client";

import { useEffect, useState } from "react";
import { api } from "@/components/pilot-context";

type Row = {
  id: string;
  status: string;
  inviteCode: string;
  identity: { name: string; uni: string; sid: string; pemail: string; uemail: string; mobile: string; dob: string } | null;
  cnic: string | null;
  audit: { signedAt: string; documentVersion: string; documentHash: string; ip: string; countersignedAt?: string; nameMismatch: boolean } | null;
  tempPassword: string | null;
  credentialsEmailed: boolean;
  firstSignInAt: string | null;
  pulses: { week: number; disappointed: string; fixFirst: string; ratings: number[] }[];
  bugs: { screen: string; actual: string; submittedAt: string }[];
  questionnaires: { mode: string; status: string }[];
  join: { interest: string; why: string; hours: string } | null;
};

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [invites, setInvites] = useState<{ code: string; note: string; participantId: string | null }[]>([]);
  const [delivery, setDelivery] = useState({ email: false });
  const [note, setNote] = useState("");
  const [issued, setIssued] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  async function load() {
    const data = await api<{ participants: Row[]; invites: typeof invites; delivery?: { email: boolean } }>("/api/admin");
    setRows(data.participants);
    setInvites(data.invites);
    if (data.delivery) setDelivery(data.delivery);
    setAuthed(true);
  }

  useEffect(() => {
    load().catch(() => setAuthed(false));
  }, []);

  async function login() {
    setError("");
    try {
      await api("/api/admin", { action: "login", password });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    }
  }

  async function act(action: string, id?: string, extra?: Record<string, string>) {
    setError("");
    try {
      const data = await api<{ tempPassword?: string; emailed?: boolean; email?: string; code?: string }>("/api/admin", {
        action,
        id,
        ...extra,
      });
      if (data.tempPassword) {
        setIssued(
          `${data.email}: ${data.tempPassword}${data.emailed ? " (also emailed)" : " (copy this, email is not connected)"}`,
        );
      }
      if (data.code) setIssued(`New invite code: ${data.code}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That action failed.");
    }
  }

  if (!authed) {
    return (
      <div className="page">
        <div className="card">
          <h1>Founder view</h1>
          <p className="mute">Approval queue, credentials, and feedback. Students never see this page’s contents.</p>
          <label htmlFor="password">Founder password</label>
          <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} style={{ maxWidth: 320 }} />
          <div className="err">{error}</div>
          <button className="btn" type="button" onClick={login}>Open</button>
        </div>
      </div>
    );
  }

  const signed = rows.filter((row) => row.status === "signed").length;
  const active = rows.filter((row) => row.status === "active").length;

  return (
    <div className="page">
      <h1>Founder view</h1>
      <p className="mute">{rows.length} participants · {signed} waiting for approval · {active} signed in</p>
      {delivery.email ? (
        <p className="ok">Verification email is configured. Codes are emailed and are not shown on screen.</p>
      ) : (
        <div className="banner">
          Verification email is not set up yet. Add RESEND_API_KEY and PILOT_EMAIL_FROM, then restart the server.
        </div>
      )}
      {issued ? <p className="ok">{issued}</p> : null}
      {error ? <p className="err">{error}</p> : null}
      <div className="cards">
        <article className="card">
          <h2 style={{ marginTop: 0 }}>New invite</h2>
          <label htmlFor="note">Note</label>
          <input id="note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="LUMS, batch A" />
          <button className="btn" type="button" onClick={() => act("create-invite", undefined, { note })}>Create code</button>
        </article>
        <article className="card">
          <h2 style={{ marginTop: 0 }}>Demo</h2>
          <p className="mute">Resets SJ-DEMO / SJ-P-001 so you can walk the flow again.</p>
          <button className="btn" type="button" onClick={() => act("reset-demo")}>Reset demo student</button>
        </article>
        <article className="card">
          <h2 style={{ marginTop: 0 }}>Targets</h2>
          <p className="mute">60% active every week. 70% complete the pulse. Most active students get a match. 40% or more say “very disappointed” if it went away. Top three fixes by week 3.</p>
        </article>
      </div>

      <h2>Invites</h2>
      <div className="card">
        <table>
          <tbody>
            {invites.map((invite) => (
              <tr key={invite.code}>
                <td><code>{invite.code}</code></td>
                <td>{invite.participantId || "unused"}</td>
                <td>{invite.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Participants</h2>
      {rows.map((row) => (
        <article className="card" key={row.id} style={{ marginBottom: 12 }}>
          <div className="row-actions">
            <strong>{row.identity?.name || "Not signed"} · {row.id}</strong>
            <span className="mute">{row.status} · {row.inviteCode}</span>
          </div>
          <p className="mute">
            Pulses {row.pulses.length}/4 · Bugs {row.bugs.length} · Questionnaires {row.questionnaires.map((item) => `${item.mode}:${item.status}`).join(", ") || "none"}
            {row.join ? ` · Join: ${row.join.interest}` : ""}
          </p>
          <div className="row-actions">
            {row.status === "signed" ? <button className="btn" type="button" onClick={() => act("approve", row.id)}>Check details, countersign and approve</button> : null}
            {row.status !== "revoked" && row.status !== "invited" ? <button className="btn alt" type="button" onClick={() => act("revoke", row.id)}>Revoke</button> : null}
            <button className="btn alt" type="button" onClick={() => setOpen(open === row.id ? null : row.id)}>Details</button>
          </div>
          {open === row.id && row.identity ? (
            <div className="box">
              <p>CNIC: <b>{row.cnic}</b></p>
              <p>{row.identity.uni} · {row.identity.sid} · {row.identity.dob}</p>
              <p>{row.identity.mobile}<br />{row.identity.pemail}<br />{row.identity.uemail}</p>
              {row.audit ? <p className="mute">Signed {row.audit.signedAt} from {row.audit.ip}. {row.audit.documentVersion}. Name mismatch: {row.audit.nameMismatch ? "yes" : "no"}.</p> : null}
              {row.tempPassword ? <p>Temporary password: <span className="pw">{row.tempPassword}</span> {row.credentialsEmailed ? "(emailed)" : ""}</p> : null}
              {row.pulses.map((pulse) => (
                <p key={pulse.week}>Week {pulse.week}: {pulse.disappointed}. Fix first: {pulse.fixFirst}</p>
              ))}
              {row.bugs.map((bug) => (
                <p key={bug.submittedAt}>Bug on {bug.screen}: {bug.actual}</p>
              ))}
              {row.join ? <p>Join note: {row.join.why} · {row.join.hours}</p> : null}
            </div>
          ) : null}
        </article>
      ))}

      <section className="card">
        <h2 style={{ marginTop: 0 }}>Interview guide (45 minutes)</h2>
        <p className="mute">Tell them you will take notes, that recording needs the consent they already gave, and that you want the honest version. Ask open questions. Do not defend the product.</p>
        <table>
          <tbody>
            <tr><td>0 to 5 min</td><td>Warm-up. “Tell me about your job search so far.”</td></tr>
            <tr><td>5 to 20 min</td><td>Their story. Pick two or three questionnaire answers and ask what happened last time.</td></tr>
            <tr><td>20 to 35 min</td><td>Walk-through. Ask how they would find and act on a job today. Do not guide them.</td></tr>
            <tr><td>35 to 42 min</td><td>“If we could only build one thing next, what should it be, and what would you give up for it?”</td></tr>
            <tr><td>42 to 45 min</td><td>Ask who else you should talk to. Thank them. Reply to every yes or maybe within a week.</td></tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
