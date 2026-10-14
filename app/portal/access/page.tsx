"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, usePilot } from "@/components/pilot-context";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { pilot } from "@/lib/config";
import { RULES, type PublicParticipant } from "@/lib/types";

export default function AccessPage() {
  const { participant, ready, setParticipant } = usePilot();
  const [rules, setRules] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function activate() {
    setBusy(true);
    setError("");
    try {
      const data = await api<{ participant: PublicParticipant }>("/api/access", {
        action: "activate",
        rules,
        newPassword: password,
      });
      setParticipant(data.participant);
      router.push("/portal/test");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!participant) return <p>Open your invite first. <Link href="/portal/invite">Enter code</Link></p>;
  if (participant.status === "invited") return <p>Finish Step 1 first. <Link href="/portal/agreements">Agreements</Link></p>;
  if (participant.status === "signed") {
    return (
      <>
        <h1>Step 2 is locked</h1>
        <p>You are signed. A founder still needs to check your details and countersign. That review is within {pilot.approvalHours} hours. Credentials are not sent before then.</p>
      </>
    );
  }
  if (participant.status === "active") {
    return (
      <>
        <h1>Signed in</h1>
        <p className="font-semibold text-primary">First sign-in confirmed. Your pilot has started.</p>
        <Button asChild><Link href="/portal/test">Go to Step 3: Test guide</Link></Button>
      </>
    );
  }

  const first = participant.identity?.name.split(" ")[0] || "there";
  return (
    <>
      <h1>Step 2 of 4: Access</h1>
      <p>You are approved. Welcome to the pilot, {first}. Your login was prepared for the email and mobile you verified.</p>
      <div className="rounded-2xl bg-secondary p-4">
        <b>Credentials</b>
        <p className="my-1.5 text-sm text-muted-foreground">
          Username: {participant.identity?.uemail}
          <br />
          Sign-in: this page
        </p>
        {participant.tempPassword ? (
          <>
            <p className="text-sm text-muted-foreground">Temporary password</p>
            <p className="font-mono text-lg font-bold tracking-wide">{participant.tempPassword}</p>
            <p className="text-sm text-muted-foreground">The credentials email did not go out. Use this temporary password once, then replace it below.</p>
          </>
        ) : (
          <p>Check the credentials email, then set a new password below. The temporary password will not work after you change it.</p>
        )}
      </div>
      <h2>Rules for using it</h2>
      <ol>
        {RULES.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ol>
      <p className="text-sm text-muted-foreground">Your activity is logged, as described in the consent form you signed.</p>
      <Label className="mt-3 flex items-start gap-3 font-normal">
        <Checkbox checked={rules} onCheckedChange={(value) => setRules(value === true)} className="mt-0.5" />
        I have read the rules.
      </Label>
      <Label htmlFor="np" className="mt-3">Set a new password</Label>
      <Input id="np" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="max-w-xs" autoComplete="new-password" />
      <p className="mt-2 text-sm text-destructive">{error}</p>
      <Button className="mt-4" type="button" disabled={busy} onClick={activate}>Sign in and confirm</Button>
    </>
  );
}
