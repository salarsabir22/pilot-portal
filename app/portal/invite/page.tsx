"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, usePilot } from "@/components/pilot-context";

export default function InvitePage() {
  const { participant, demo, setParticipant } = usePilot();
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [needsPassword, setNeedsPassword] = useState(false);
  const [hint, setHint] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

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
      <h1>Welcome to the swypejobs. pilot</h1>
      <p>A private test of a swipe-based job app for students. It takes up to 5 hours a week for 4 weeks. You only see the product after Step 1 is approved.</p>
      {needsPassword ? (
        <>
          <p>This invite already has a password. Sign in with the email you verified{hint ? ` (${hint})` : ""}.</p>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" />
          <Label htmlFor="password" className="mt-3">Password</Label>
          <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
          <p className="mt-2 text-sm text-destructive">{error}</p>
          <Button className="mt-4" type="button" disabled={busy} onClick={signIn}>Sign in</Button>
        </>
      ) : (
        <>
          <Label htmlFor="code">Invite code</Label>
          <Input id="code" value={code} onChange={(event) => setCode(event.target.value)} placeholder="Invite code" autoComplete="off" />
          <p className="mt-2 text-sm text-destructive">{error}</p>
          <Button className="mt-4" type="button" disabled={busy} onClick={openInvite}>Open my invite</Button>
          {demo ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Demo code: <code>SJ-DEMO</code>. Spare codes: <code>SJ-INVITE-02</code>, <code>SJ-INVITE-03</code>.
            </p>
          ) : null}
        </>
      )}
    </>
  );
}
