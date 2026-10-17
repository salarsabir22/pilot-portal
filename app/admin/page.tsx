"use client";

import { Fragment, useEffect, useState } from "react";
import { Check, ChevronDown, Loader2, MoreHorizontal } from "lucide-react";
import { api } from "@/components/pilot-context";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Row = {
  id: string;
  status: string;
  inviteCode: string;
  audience: "student" | "recruiter";
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
  const [invites, setInvites] = useState<{ code: string; note: string; participantId: string | null; audience: "student" | "recruiter" }[]>([]);
  const [delivery, setDelivery] = useState({ email: false });
  const [note, setNote] = useState("");
  const [audience, setAudience] = useState<"student" | "recruiter">("student");
  const [issued, setIssued] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);

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
    if (loggingIn) return;
    setLoggingIn(true);
    setError("");
    try {
      await api("/api/admin", { action: "login", password });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setLoggingIn(false);
    }
  }

  async function logout() {
    if (leaving) return;
    setLeaving(true);
    setError("");
    try {
      await api("/api/admin", { action: "logout" });
      window.location.replace("/admin");
    } catch (err) {
      setLeaving(false);
      setError(err instanceof Error ? err.message : "Could not sign out.");
    }
  }

  async function act(action: string, id?: string, extra?: Record<string, string>) {
    const key = id ? `${action}:${id}` : action;
    if (busyKey) return;
    setBusyKey(key);
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
    } finally {
      setBusyKey(null);
    }
  }

  function isBusy(action: string, id?: string) {
    const key = id ? `${action}:${id}` : action;
    return busyKey === key;
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
            <Button type="button" disabled={loggingIn} onClick={login}>
              {loggingIn ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Opening…
                </>
              ) : (
                "Open"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const signed = rows.filter((row) => row.status === "signed").length;
  const active = rows.filter((row) => row.status === "active").length;
  const targets = [
    ["60%", "Active every week"],
    ["70%", "Complete the pulse"],
    ["A match", "For most active students"],
    ["40%+", "Very disappointed if it went away"],
    ["Week 3", "Top three fixes decided"],
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-12 md:py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1>Founder view</h1>
          <p className="text-sm text-muted-foreground">
            {rows.length} participants · {signed} waiting for approval · {active} signed in
          </p>
        </div>
        <Button variant="outline" type="button" disabled={leaving || !!busyKey} onClick={logout}>
          {leaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Signing out…
            </>
          ) : (
            "Sign out"
          )}
        </Button>
      </div>
      {delivery.email ? (
        <Alert>Verification email is configured. Codes are emailed and are not shown on screen.</Alert>
      ) : (
        <Alert className="border-dashed bg-secondary">
          Verification email is not set up yet. Add RESEND_API_KEY and PILOT_EMAIL_FROM, then restart the server.
        </Alert>
      )}
      {issued ? <Alert className="font-semibold text-primary">{issued}</Alert> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>New invite</CardTitle>
          <CardDescription>One-time code. Student invites create a student app login; recruiter invites create a recruiter app login.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="audience">Audience</Label>
              <Select value={audience} onValueChange={(value) => setAudience(value as "student" | "recruiter")}>
                <SelectTrigger id="audience" className="min-w-[10rem]">
                  <SelectValue placeholder="Audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="recruiter">Recruiter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <Label htmlFor="note">Note</Label>
              <Input
                id="note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder={audience === "recruiter" ? "Acme Corp, hiring lead" : "LUMS, batch A"}
              />
            </div>
            <Button
              type="button"
              disabled={!!busyKey}
              onClick={() => act("create-invite", undefined, { note, audience })}
            >
              {isBusy("create-invite") ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Creating…
                </>
              ) : (
                "Create code"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="m-0 text-lg">Targets</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {targets.map(([value, label]) => (
            <Card key={label}>
              <CardContent className="p-5 pt-5 sm:p-5 sm:pt-5">
                <p className="text-2xl font-extrabold tracking-tight">{value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col gap-4 p-5 pt-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 sm:pt-6">
            <div className="space-y-1">
              <p className="font-semibold">Demo student</p>
              <p className="text-sm text-muted-foreground">Resets SJ-DEMO / SJ-P-001.</p>
            </div>
            <Button variant="outline" type="button" disabled={!!busyKey} onClick={() => act("reset-demo")}>
              {isBusy("reset-demo") ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Resetting…
                </>
              ) : (
                "Reset"
              )}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-4 p-5 pt-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 sm:pt-6">
            <div className="space-y-1">
              <p className="font-semibold">Demo recruiter</p>
              <p className="text-sm text-muted-foreground">Resets SJ-R-DEMO / SJ-P-002.</p>
            </div>
            <Button variant="outline" type="button" disabled={!!busyKey} onClick={() => act("reset-demo-recruiter")}>
              {isBusy("reset-demo-recruiter") ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Resetting…
                </>
              ) : (
                "Reset"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <h2>Invites</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Audience</TableHead>
            <TableHead>Participant</TableHead>
            <TableHead>Note</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invites.map((invite) => (
            <TableRow key={invite.code}>
              <TableCell>
                <code>{invite.code}</code>
              </TableCell>
              <TableCell>
                <Badge>{invite.audience || "student"}</Badge>
              </TableCell>
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
            <TableHead>Participant</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Pulses</TableHead>
            <TableHead className="text-right">Bugs</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const rowBusy = busyKey?.endsWith(`:${row.id}`) ?? false;
            const detailsOpen = open === row.id;
            return (
              <Fragment key={row.id}>
                <TableRow>
                  <TableCell>
                    <div className="font-medium">{row.identity?.name || "Not signed"}</div>
                    <div className="text-muted-foreground">
                      {row.id} · {row.inviteCode} · {row.audience || "student"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge>{row.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{row.pulses.length}/4</TableCell>
                  <TableCell className="text-right tabular-nums">{row.bugs.length}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline" type="button" disabled={rowBusy || !!busyKey}>
                          {rowBusy ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" /> Working…
                            </>
                          ) : (
                            <>
                              Actions
                              <ChevronDown className="h-4 w-4 opacity-60" />
                            </>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Participant</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          disabled={rowBusy}
                          onSelect={() => setOpen(detailsOpen ? null : row.id)}
                        >
                          {detailsOpen ? (
                            <>
                              <Check className="h-4 w-4" /> Hide details
                            </>
                          ) : (
                            <>
                              <MoreHorizontal className="h-4 w-4" /> Details
                            </>
                          )}
                        </DropdownMenuItem>
                        {row.status === "signed" ? (
                          <DropdownMenuItem
                            disabled={rowBusy || !!busyKey}
                            onSelect={() => void act("approve", row.id)}
                          >
                            {isBusy("approve", row.id) ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" /> Approving…
                              </>
                            ) : (
                              "Approve"
                            )}
                          </DropdownMenuItem>
                        ) : null}
                        {row.status !== "revoked" && row.status !== "invited" ? (
                          <DropdownMenuItem
                            disabled={rowBusy || !!busyKey}
                            className="text-destructive focus:text-destructive"
                            onSelect={() => void act("revoke", row.id)}
                          >
                            {isBusy("revoke", row.id) ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" /> Revoking…
                              </>
                            ) : (
                              "Revoke"
                            )}
                          </DropdownMenuItem>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                {detailsOpen && row.identity ? (
                  <TableRow>
                    <TableCell colSpan={5} className="bg-muted/50">
                      <div className="space-y-2">
                        <p>
                          CNIC: <b>{row.cnic}</b>
                        </p>
                        <p>
                          {row.identity.uni} · {row.identity.sid} · {row.identity.dob}
                        </p>
                        <p>
                          {row.identity.mobile}
                          <br />
                          {row.identity.pemail}
                          <br />
                          {row.identity.uemail}
                        </p>
                        <p className="text-muted-foreground">
                          Questionnaires {row.questionnaires.map((item) => `${item.mode}:${item.status}`).join(", ") || "none"}
                          {row.join ? ` · Join: ${row.join.interest}` : ""}
                        </p>
                        {row.audit ? (
                          <p className="text-muted-foreground">
                            Signed {row.audit.signedAt} from {row.audit.ip}. {row.audit.documentVersion}. Name mismatch:{" "}
                            {row.audit.nameMismatch ? "yes" : "no"}.
                          </p>
                        ) : null}
                        {row.tempPassword ? (
                          <p>
                            Temporary password: <code className="font-bold">{row.tempPassword}</code>{" "}
                            {row.credentialsEmailed ? "(emailed)" : ""}
                          </p>
                        ) : null}
                        {row.pulses.map((pulse) => (
                          <p key={pulse.week}>
                            Week {pulse.week}: {pulse.disappointed}. Fix first: {pulse.fixFirst}
                          </p>
                        ))}
                        {row.bugs.map((bug) => (
                          <p key={bug.submittedAt}>
                            Bug on {bug.screen}: {bug.actual}
                          </p>
                        ))}
                        {row.join ? (
                          <p>
                            Join note: {row.join.why} · {row.join.hours}
                          </p>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : null}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>

      <Card>
        <CardHeader>
          <CardTitle>Interview guide (45 minutes)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Tell them you will take notes, that recording needs the consent they already gave, and that you want the honest
            version. Ask open questions. Do not defend the product.
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>What to cover</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="whitespace-nowrap font-medium">0 to 5 min</TableCell>
                <TableCell>Warm-up. “Tell me about your job search so far.”</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="whitespace-nowrap font-medium">5 to 20 min</TableCell>
                <TableCell>Their story. Pick two or three questionnaire answers and ask what happened last time.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="whitespace-nowrap font-medium">20 to 35 min</TableCell>
                <TableCell>Walk-through. Ask how they would find and act on a job today. Do not guide them.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="whitespace-nowrap font-medium">35 to 42 min</TableCell>
                <TableCell>
                  “If we could only build one thing next, what should it be, and what would you give up for it?”
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="whitespace-nowrap font-medium">42 to 45 min</TableCell>
                <TableCell>Ask who else you should talk to. Thank them. Reply to every yes or maybe within a week.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
