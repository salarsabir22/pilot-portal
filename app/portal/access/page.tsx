"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, usePilot } from "@/components/pilot-context";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { appLoginUrl, pilot } from "@/lib/config";
import { RULES, type PublicParticipant } from "@/lib/types";

export default function AccessPage() {
  const { participant, ready, setParticipant } = usePilot();
  const [rules, setRules] = useState(false);
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
      });
      setParticipant(data.participant);
      router.push("/portal/test");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not continue.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!participant) {
    return (
      <p>
        Open your invite first. <Link href="/portal/invite">Enter code</Link>
      </p>
    );
  }
  if (participant.status === "invited") {
    return (
      <p>
        Finish Step 1 first. <Link href="/portal/agreements">Agreements</Link>
      </p>
    );
  }
  if (participant.status === "signed") {
    return (
      <>
        <h1>Step 2 is locked</h1>
        <p>
          You are signed. A founder still needs to check your details and countersign. That review is within{" "}
          {pilot.approvalHours} hours. Credentials are not sent before then.
        </p>
      </>
    );
  }
  if (participant.status === "active") {
    return (
      <>
        <h1>Signed in</h1>
        <p className="font-semibold text-primary">First sign-in confirmed. Your pilot has started.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/portal/test">Next: Test guide</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/portal/feedback">Skip to feedback</Link>
          </Button>
        </div>
      </>
    );
  }

  const first = participant.identity?.name.split(" ")[0] || "there";
  const isRecruiter = participant.audience === "recruiter";
  const appEmail = participant.identity?.pemail || participant.identity?.uemail || "";
  return (
    <>
      <h1>Step 2 of 4: Access</h1>
      <p>
        You are approved. Welcome to the {isRecruiter ? "recruiter " : ""}pilot, {first}. Your{" "}
        {isRecruiter ? "recruiter" : "student"} app login was prepared for the email you verified.
      </p>
      <div className="rounded-2xl bg-secondary p-4">
        <b>App credentials ({isRecruiter ? "recruiter login" : "student login"})</b>
        <p className="my-1.5 text-sm text-muted-foreground">
          Email: {appEmail}
          <br />
          App sign-in: {appLoginUrl()}
        </p>
        {participant.tempPassword ? (
          <>
            <p className="text-sm text-muted-foreground">Temporary password</p>
            <p className="font-mono text-lg font-bold tracking-wide">{participant.tempPassword}</p>
            <p className="text-sm text-muted-foreground">
              Use this password to sign in to the app. The credentials email may also include it.
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Check the credentials email for your temporary app password.</p>
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
      <p className="mt-2 text-sm text-destructive">{error}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="button" disabled={busy || !rules} onClick={activate}>
          {busy ? "Starting…" : "Next: Start pilot"}
        </Button>
        <Button variant="outline" asChild>
          <a href={appLoginUrl()} target="_blank" rel="noreferrer">
            Open app login
          </a>
        </Button>
      </div>
    </>
  );
}
