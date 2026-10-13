"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, usePilot } from "@/components/pilot-context";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const fields = [
  ["screen", "Which screen or page were you on?"],
  ["steps", "What did you do just before it happened?"],
  ["expected", "What did you expect to happen?"],
  ["actual", "What happened instead?"],
  ["time", "Roughly what date and time was it?"],
] as const;

export default function BugPage() {
  const { participant, ready } = usePilot();
  const [form, setForm] = useState({ screen: "", steps: "", expected: "", actual: "", time: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit() {
    setBusy(true);
    setError("");
    try {
      await api("/api/feedback", { kind: "bug", ...form });
      router.push("/portal/feedback");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the report.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (participant?.status !== "active") return <p>Sign in first. <Link href="/portal/access">Access</Link></p>;

  return (
    <>
      <Button variant="outline" asChild><Link href="/portal/feedback">Back</Link></Button>
      <h1 className="mt-4">Report a bug</h1>
      <p className="text-sm text-muted-foreground">Words only. Do not paste screenshots or product text. Our logs can match the time you give us.</p>
      {fields.map(([key, label]) => (
        <div className="mt-3 space-y-2" key={key}>
          <Label htmlFor={key}>{label}</Label>
          <Textarea id={key} rows={3} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />
        </div>
      ))}
      <p className="mt-2 text-sm text-destructive">{error}</p>
      <Button className="mt-4" type="button" disabled={busy} onClick={submit}>Send bug report</Button>
    </>
  );
}
