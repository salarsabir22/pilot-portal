"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { api } from "@/components/pilot-context";
import type { AdminParticipant } from "@/lib/admin-serialize";
import { JOIN_CAPACITIES, PULSE_STATEMENTS, QUESTIONS, questionsFor } from "@/lib/questions";
import {
  identityFieldsFor,
  optionalConsentsFor,
  requiredConsentsFor,
} from "@/lib/types";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function formatWhen(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function displayAnswer(value: string | string[] | null | undefined) {
  if (value == null) return "—";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  const trimmed = String(value).trim();
  return trimmed || "—";
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1 border-b border-border/60 py-3 last:border-0">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="whitespace-pre-wrap text-sm leading-relaxed">{children}</div>
    </div>
  );
}

function Section({
  title,
  description,
  children,
  empty,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
  empty?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        {empty ? <p className="text-sm text-muted-foreground">Nothing submitted yet.</p> : children}
      </CardContent>
    </Card>
  );
}

export default function ParticipantDetailPage() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params.id || "");

  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [participant, setParticipant] = useState<AdminParticipant | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<"approve" | "revoke" | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api<{ participant: AdminParticipant }>(`/api/admin/${encodeURIComponent(id)}`);
      setParticipant(data.participant);
      setAuthed(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not load participant.";
      if (message.toLowerCase().includes("founder") || message.toLowerCase().includes("sign-in") || message.includes("401")) {
        setAuthed(false);
        setParticipant(null);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    load().catch(() => setAuthed(false));
  }, [id, load]);

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

  async function act(action: "approve" | "revoke") {
    if (!participant || busy) return;
    setBusy(action);
    setError("");
    try {
      await api("/api/admin", { action, id: participant.id });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That action failed.");
    } finally {
      setBusy(null);
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
            <p className="text-sm text-muted-foreground">Sign in to open this participant’s full submission.</p>
            <Label htmlFor="password">Founder password</Label>
            <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
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

  if (loading && !participant) {
    return (
      <div className="mx-auto flex max-w-5xl items-center gap-2 px-6 py-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading participant…
      </div>
    );
  }

  if (!participant) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 px-6 py-16">
        <Button variant="outline" asChild>
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4" /> Back to list
          </Link>
        </Button>
        <Alert className="border-destructive/40 text-destructive">{error || "Participant not found."}</Alert>
      </div>
    );
  }

  const identityFields = identityFieldsFor(participant.audience);
  const requiredLabels = requiredConsentsFor(participant.audience);
  const optionalLabels = optionalConsentsFor(participant.audience);
  const identity = participant.identity;
  const consents = participant.consents;
  const audit = participant.audit;
  const mid = participant.questionnaires.find((item) => item.mode === "mid");
  const end = participant.questionnaires.find((item) => item.mode === "end");

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-12 md:py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4" /> All participants
            </Link>
          </Button>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="m-0">{identity?.name || "Not signed yet"}</h1>
              <Badge>{participant.status}</Badge>
              <Badge className="bg-muted">{participant.audience}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {participant.id} · invite {participant.inviteCode} · created {formatWhen(participant.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {participant.status === "signed" ? (
            <Button type="button" disabled={!!busy} onClick={() => void act("approve")}>
              {busy === "approve" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Approving…
                </>
              ) : (
                "Approve"
              )}
            </Button>
          ) : null}
          {participant.status !== "revoked" && participant.status !== "invited" ? (
            <Button type="button" variant="outline" disabled={!!busy} onClick={() => void act("revoke")}>
              {busy === "revoke" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Revoking…
                </>
              ) : (
                "Revoke"
              )}
            </Button>
          ) : null}
          <Button type="button" variant="ghost" disabled={loading} onClick={() => void load()}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Refreshing…
              </>
            ) : (
              "Refresh"
            )}
          </Button>
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Section title="Identity" description="Everything entered on Step 1." empty={!identity}>
        {identity ? (
          <div>
            {identityFields.map((field) => (
              <Field key={field.key} label={field.label}>
                {displayAnswer(identity[field.key])}
              </Field>
            ))}
            <Field label="CNIC / national ID">{displayAnswer(participant.cnic)}</Field>
          </div>
        ) : null}
      </Section>

      <Section title="Consents" empty={!consents}>
        {consents ? (
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-sm font-semibold">Required</h3>
              {requiredLabels.map((label, index) => (
                <Field key={label} label={label}>
                  {consents.required[index] ? "Yes" : "No"}
                </Field>
              ))}
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold">Optional</h3>
              {optionalLabels.map((label, index) => (
                <Field key={label} label={label}>
                  {consents.optional[index] ? "Yes" : "No"}
                </Field>
              ))}
            </div>
          </div>
        ) : null}
      </Section>

      <Section title="Signature & audit" empty={!audit}>
        {audit ? (
          <div>
            <Field label="Typed name">{displayAnswer(audit.typedName)}</Field>
            <Field label="Name mismatch">{audit.nameMismatch ? "Yes — typed name did not match identity" : "No"}</Field>
            <Field label="Signed at">{formatWhen(audit.signedAt)}</Field>
            <Field label="IP">{displayAnswer(audit.ip)}</Field>
            <Field label="User agent">{displayAnswer(audit.userAgent)}</Field>
            <Field label="Document version">{displayAnswer(audit.documentVersion)}</Field>
            <Field label="Document hash">
              <code className="break-all text-xs">{audit.documentHash || "—"}</code>
            </Field>
            <Field label="OTP confirmed">{audit.otpConfirmed ? "Yes" : "No"}</Field>
            <Field label="Countersigned at">{formatWhen(audit.countersignedAt)}</Field>
            <Field label="Countersigned by">{displayAnswer(audit.countersignedBy)}</Field>
          </div>
        ) : null}
      </Section>

      <Section title="Access & credentials">
        <div>
          <Field label="Temporary password">
            {participant.tempPassword ? (
              <>
                <code className="font-semibold">{participant.tempPassword}</code>
                {participant.credentialsEmailed ? " (emailed)" : " (not emailed)"}
              </>
            ) : (
              "—"
            )}
          </Field>
          <Field label="App user id">{displayAnswer(participant.appUserId)}</Field>
          <Field label="First sign-in">{formatWhen(participant.firstSignInAt)}</Field>
        </div>
      </Section>

      <Section
        title="Weekly pulses"
        description={`${participant.pulses.length} of 4 weeks submitted`}
        empty={!participant.pulses.length}
      >
        <div className="space-y-8">
          {participant.pulses
            .slice()
            .sort((a, b) => a.week - b.week)
            .map((pulse) => (
              <div key={`${pulse.week}-${pulse.submittedAt}`} className="rounded-lg border border-border/70 p-4">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <h3 className="m-0 text-base font-semibold">Week {pulse.week}</h3>
                  <Badge className="bg-muted font-normal">{formatWhen(pulse.submittedAt)}</Badge>
                </div>
                <Field label="Device">{displayAnswer(pulse.device)}</Field>
                <Field label="Hours testing">{displayAnswer(pulse.hours)}</Field>
                <Field label="Days used">{displayAnswer(pulse.days)}</Field>
                <Field label="If this disappeared tomorrow">{displayAnswer(pulse.disappointed)}</Field>
                {PULSE_STATEMENTS.map((statement, index) => (
                  <Field key={statement} label={statement}>
                    {pulse.ratings?.[index] != null ? `${pulse.ratings[index]} / 5` : "—"}
                  </Field>
                ))}
                <Field label="Best part">{displayAnswer(pulse.best)}</Field>
                <Field label="Most frustrating">{displayAnswer(pulse.frustrating)}</Field>
                <Field label="Fix first">{displayAnswer(pulse.fixFirst)}</Field>
                <Field label="What confused you">{displayAnswer(pulse.confused)}</Field>
                <Field label="What you expected but missed">{displayAnswer(pulse.expectedMiss)}</Field>
                <Field label="Got a match">{displayAnswer(pulse.match)}</Field>
                <Field label="Conversation">{displayAnswer(pulse.conversation)}</Field>
                <Field label="Why no match">{displayAnswer(pulse.noMatchWhy)}</Field>
                <Field label="Hit a bug">{displayAnswer(pulse.hitBug)}</Field>
                <Field label="Bug screen">{displayAnswer(pulse.bugScreen)}</Field>
                <Field label="Bug steps">{displayAnswer(pulse.bugSteps)}</Field>
                <Field label="Bug expected">{displayAnswer(pulse.bugExpected)}</Field>
                <Field label="Bug time">{displayAnswer(pulse.bugTime)}</Field>
                <Field label="Main blocker">{displayAnswer(pulse.blocker)}</Field>
                <Field label="What to ask next">{displayAnswer(pulse.nextAsk)}</Field>
                <Field label="Anything else">{displayAnswer(pulse.anythingElse)}</Field>
              </div>
            ))}
        </div>
      </Section>

      <Section title="Bug reports" description={`${participant.bugs.length} report(s)`} empty={!participant.bugs.length}>
        <div className="space-y-6">
          {participant.bugs.map((bug) => (
            <div key={bug.id || bug.submittedAt} className="rounded-lg border border-border/70 p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <h3 className="m-0 text-base font-semibold">{bug.screen || "Untitled screen"}</h3>
                <Badge className="bg-muted font-normal">{formatWhen(bug.submittedAt)}</Badge>
              </div>
              <Field label="Steps">{displayAnswer(bug.steps)}</Field>
              <Field label="Expected">{displayAnswer(bug.expected)}</Field>
              <Field label="Actual">{displayAnswer(bug.actual)}</Field>
              <Field label="When it happened">{displayAnswer(bug.time)}</Field>
            </div>
          ))}
        </div>
      </Section>

      {(["mid", "end"] as const).map((mode) => {
        const questionnaire = mode === "mid" ? mid : end;
        const questions = questionsFor(mode);
        return (
          <Section
            key={mode}
            title={mode === "mid" ? "Mid-pilot questionnaire" : "End-of-pilot questionnaire"}
            description={
              questionnaire
                ? `${questionnaire.status} · updated ${formatWhen(questionnaire.updatedAt)}${
                    questionnaire.submittedAt ? ` · submitted ${formatWhen(questionnaire.submittedAt)}` : ""
                  }`
                : undefined
            }
            empty={!questionnaire}
          >
            {questionnaire ? (
              <div>
                {questions.map((question) => {
                  const answer = questionnaire.answers?.[question.id];
                  return (
                    <Field key={question.id} label={`${question.section} — ${question.label}`}>
                      {displayAnswer(answer)}
                    </Field>
                  );
                })}
                {Object.entries(questionnaire.answers || {})
                  .filter(([key]) => !QUESTIONS.some((question) => question.id === key))
                  .map(([key, value]) => (
                    <Field key={key} label={`Other (${key})`}>
                      {displayAnswer(value)}
                    </Field>
                  ))}
              </div>
            ) : null}
          </Section>
        );
      })}

      <Section title="Join interest" empty={!participant.join}>
        {participant.join ? (
          <div>
            <Field label="Submitted">{formatWhen(participant.join.submittedAt)}</Field>
            <Field label="Interest">{displayAnswer(participant.join.interest)}</Field>
            <Field label="Capacities">
              {participant.join.capacities?.length
                ? participant.join.capacities
                    .map((item) => JOIN_CAPACITIES.find((label) => label === item) || item)
                    .join(", ")
                : "—"}
            </Field>
            <Field label="Something else">{displayAnswer(participant.join.other)}</Field>
            <Field label="Why a good fit">{displayAnswer(participant.join.why)}</Field>
            <Field label="Skills / projects">{displayAnswer(participant.join.skills)}</Field>
            <Field label="Hours available">{displayAnswer(participant.join.hours)}</Field>
            <Field label="What would make it worthwhile">{displayAnswer(participant.join.worthwhile)}</Field>
            <Field label="Anything we should know">{displayAnswer(participant.join.know)}</Field>
          </div>
        ) : null}
      </Section>

      <Section title="Session log" empty={!participant.logs.length}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>User agent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participant.logs
              .slice()
              .reverse()
              .map((log, index) => (
                <TableRow key={`${log.at}-${log.event}-${index}`}>
                  <TableCell className="whitespace-nowrap">{formatWhen(log.at)}</TableCell>
                  <TableCell>
                    <Badge className="bg-muted font-normal">{log.event}</Badge>
                  </TableCell>
                  <TableCell>{log.ip}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">{log.userAgent}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Section>
    </div>
  );
}
