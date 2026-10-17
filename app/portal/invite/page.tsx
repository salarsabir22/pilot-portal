"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, usePilot } from "@/components/pilot-context";

function InviteForm() {
  const { participant, demo, setParticipant } = usePilot();
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [needsPassword, setNeedsPassword] = useState(false);
  const [hint, setHint] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const recruiterTone = searchParams.get("from") === "recruiter" || participant?.audience === "recruiter";

  async function openInvite() {
    setBusy(true);
    setError("");
    try {
      const data = await api<{ participant?: typeof participant; needsPassword?: boolean; emailHint?: string }>("/api/invite", { code });
      if (data.needsPassword) {
        setNeedsPassword(true);
        setHint(data.emailHint || "");
        return;
      }
      if (data.participant) setParticipant(data.participant);
      router.push("/portal/agreements");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open that invite.");
    } finally {
      setBusy(false);
    }
  }

  async function signIn() {
    setBusy(true);
    setError("");
    try {
      const data = await api<{ participant: NonNullable<typeof participant> }>("/api/access", {
        action: "login",
        email,
        password,
      });
      setParticipant(data.participant);
      router.push("/portal/test");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  if (participant && participant.status !== "active") {
    return (
      <>
        <h1>Invite accepted</h1>
        <p className="font-semibold text-primary">You are in as {participant.id}.</p>
        <Button type="button" onClick={() => router.push(participant.status === "invited" ? "/portal/agreements" : "/portal/access")}>
          Continue
        </Button>
      </>
    );
  }

  if (participant?.status === "active") {
    return (
      <>
        <h1>You are signed in</h1>
        <p className="font-semibold text-primary">{participant.identity?.name} · {participant.id}</p>
        <Button type="button" onClick={() => router.push("/portal/test")}>Go to the test guide</Button>
      </>
    );
  }

  return (
    <>
      <h1>{recruiterTone ? "Welcome to the recruiter pilot" : "Welcome to the student pilot"}</h1>
      <p>
        {recruiterTone
          ? "Private hiring-side test. Enter your recruiter invite code. Same portal steps as students; approval creates a recruiter app login."
          : "Private student test. Enter your invite code. You only see the product after Step 1 is approved."}
      </p>
      <p className="text-sm text-muted-foreground">
        {recruiterTone ? (
          <>
            Overview:{" "}
            <Link href="/recruiters" className="font-semibold text-primary underline-offset-4 hover:underline">
              /recruiters
            </Link>
          </>
        ) : (
          <>
            Hiring instead?{" "}
            <Link href="/recruiters" className="font-semibold text-primary underline-offset-4 hover:underline">
              Recruiter pilot
            </Link>
          </>
        )}
      </p>
      {needsPassword ? (
        <>
          <p>This invite already has a password. Sign in with the email you verified{hint ? ` (${hint})` : ""}.</p>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" />
          <Label htmlFor="password" className="mt-3">
            Password
          </Label>
          <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
          <p className="mt-2 text-sm text-destructive">{error}</p>
          <Button className="mt-4" type="button" disabled={busy} onClick={signIn}>
            Sign in
          </Button>
        </>
      ) : (
        <>
          <Label htmlFor="code">Invite code</Label>
          <Input id="code" value={code} onChange={(event) => setCode(event.target.value)} placeholder="Invite code" autoComplete="off" />
          <p className="mt-2 text-sm text-destructive">{error}</p>
          <Button className="mt-4" type="button" disabled={busy} onClick={openInvite}>
            Open my invite
          </Button>
          {demo ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Demo student: <code>SJ-DEMO</code>. Demo recruiter: <code>SJ-R-DEMO</code>. Spare: <code>SJ-INVITE-02</code>,{" "}
              <code>SJ-INVITE-03</code>.
            </p>
          ) : null}
        </>
      )}
    </>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
      <InviteForm />
    </Suspense>
  );
}
