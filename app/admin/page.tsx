"use client";

import { Fragment, useEffect, useState } from "react";
import { api } from "@/components/pilot-context";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
      const data = await api<{ tempPassword?: string; emailed?: boolean; email?: string; code?: string; appLogin?: string }>("/api/admin", {
        action,
        id,
        ...extra,
      });
      if (data.tempPassword) {
        setIssued(
          `${data.email}: ${data.tempPassword}. App login: ${data.appLogin}${data.emailed ? " (also emailed)" : " (copy this, email is not connected)"}`,
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
      <div className="mx-auto max-w-md px-6 py-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-extrabold">Founder view</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm text-muted-foreground">Approval queue, credentials, and feedback. Students never see this page’s contents.</p>
            <Label htmlFor="password">Founder password</Label>
            <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            <p className="text-sm text-destructive">{error}</p>
            <Button type="button" onClick={login}>Open</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const signed = rows.filter((row) => row.status === "signed").length;
  const active = rows.filter((row) => row.status === "active").length;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-12 md:py-16">
      <h1>Founder view</h1>
      <p className="text-sm text-muted-foreground">{rows.length} participants · {signed} waiting for approval · {active} signed in</p>
      {delivery.email ? (
        <p className="font-semibold text-primary">Verification email is configured. Codes are emailed and are not shown on screen.</p>
      ) : (
        <Alert className="border-dashed bg-secondary">
          Verification email is not set up yet. Add RESEND_API_KEY and PILOT_EMAIL_FROM, then restart the server.
        </Alert>
      )}
      {issued ? <p className="font-semibold text-primary">{issued}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="grid items-start gap-6 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>New invite</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Label htmlFor="note">Note</Label>
            <Input id="note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="LUMS, batch A" />
            <Button type="button" onClick={() => act("create-invite", undefined, { note })}>Create code</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Demo</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Resets SJ-DEMO / SJ-P-001 so you can walk the flow again.</p>
            <Button type="button" onClick={() => act("reset-demo")}>Reset demo student</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Targets</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">60% active every week. 70% complete the pulse. Most active students get a match. 40% or more say “very disappointed” if it went away. Top three fixes by week 3.</p>
          </CardContent>
        </Card>
      </div>

      <h2>Invites</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Student</TableHead>
            <TableHead>Note</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invites.map((invite) => (
            <TableRow key={invite.code}>
              <TableCell><code>{invite.code}</code></TableCell>
              <TableCell>{invite.participantId || "Unused"}</TableCell>
              <TableCell>{invite.note}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <h2>Participants</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Pulses</TableHead>
            <TableHead className="text-right">Bugs</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <Fragment key={row.id}>
              <TableRow>
                <TableCell>
                  <div className="font-medium">{row.identity?.name || "Not signed"}</div>
                  <div className="text-muted-foreground">{row.id} · {row.inviteCode}</div>
                </TableCell>
                <TableCell><Badge>{row.status}</Badge></TableCell>
                <TableCell className="text-right tabular-nums">{row.pulses.length}/4</TableCell>
                <TableCell className="text-right tabular-nums">{row.bugs.length}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    {row.status === "signed" ? <Button size="sm" type="button" onClick={() => act("approve", row.id)}>Approve</Button> : null}
                    {row.status !== "revoked" && row.status !== "invited" ? <Button size="sm" variant="outline" type="button" onClick={() => act("revoke", row.id)}>Revoke</Button> : null}
                    <Button size="sm" variant="outline" type="button" onClick={() => setOpen(open === row.id ? null : row.id)}>Details</Button>
                  </div>
                </TableCell>
              </TableRow>
              {open === row.id && row.identity ? (
                <TableRow>
                  <TableCell colSpan={5} className="bg-muted/50">
                    <div className="space-y-2">
                      <p>CNIC: <b>{row.cnic}</b></p>
                      <p>{row.identity.uni} · {row.identity.sid} · {row.identity.dob}</p>
                      <p>{row.identity.mobile}<br />{row.identity.pemail}<br />{row.identity.uemail}</p>
                      <p className="text-muted-foreground">
                        Questionnaires {row.questionnaires.map((item) => `${item.mode}:${item.status}`).join(", ") || "none"}
                        {row.join ? ` · Join: ${row.join.interest}` : ""}
                      </p>
                      {row.audit ? <p className="text-muted-foreground">Signed {row.audit.signedAt} from {row.audit.ip}. {row.audit.documentVersion}. Name mismatch: {row.audit.nameMismatch ? "yes" : "no"}.</p> : null}
                      {row.tempPassword ? <p>Temporary password: <code className="font-bold">{row.tempPassword}</code> {row.credentialsEmailed ? "(emailed)" : ""}</p> : null}
                      {row.pulses.map((pulse) => (
                        <p key={pulse.week}>Week {pulse.week}: {pulse.disappointed}. Fix first: {pulse.fixFirst}</p>
                      ))}
                      {row.bugs.map((bug) => (
                        <p key={bug.submittedAt}>Bug on {bug.screen}: {bug.actual}</p>
                      ))}
                      {row.join ? <p>Join note: {row.join.why} · {row.join.hours}</p> : null}
                    </div>
                  </TableCell>
                </TableRow>
              ) : null}
            </Fragment>
          ))}
        </TableBody>
      </Table>

      <Card>
        <CardHeader><CardTitle>Interview guide (45 minutes)</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Tell them you will take notes, that recording needs the consent they already gave, and that you want the honest version. Ask open questions. Do not defend the product.</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>What to cover</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow><TableCell className="whitespace-nowrap font-medium">0 to 5 min</TableCell><TableCell>Warm-up. “Tell me about your job search so far.”</TableCell></TableRow>
              <TableRow><TableCell className="whitespace-nowrap font-medium">5 to 20 min</TableCell><TableCell>Their story. Pick two or three questionnaire answers and ask what happened last time.</TableCell></TableRow>
              <TableRow><TableCell className="whitespace-nowrap font-medium">20 to 35 min</TableCell><TableCell>Walk-through. Ask how they would find and act on a job today. Do not guide them.</TableCell></TableRow>
              <TableRow><TableCell className="whitespace-nowrap font-medium">35 to 42 min</TableCell><TableCell>“If we could only build one thing next, what should it be, and what would you give up for it?”</TableCell></TableRow>
              <TableRow><TableCell className="whitespace-nowrap font-medium">42 to 45 min</TableCell><TableCell>Ask who else you should talk to. Thank them. Reply to every yes or maybe within a week.</TableCell></TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
