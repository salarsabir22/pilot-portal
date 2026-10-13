"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, usePilot } from "@/components/pilot-context";

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

  if (!ready) return <p className="mute">Loading…</p>;
  if (participant?.status !== "active") return <p>Sign in first. <Link href="/portal/access">Access</Link></p>;

  return (
    <>
      <Link className="btn alt" href="/portal/feedback" style={{ marginTop: 0 }}>Back</Link>
      <h1>Report a bug</h1>
      <p className="mute">Words only. Do not paste screenshots or product text. Our logs can match the time you give us.</p>
      {fields.map(([key, label]) => (
        <div key={key}>
          <label htmlFor={key}>{label}</label>
          <textarea id={key} rows={3} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />
        </div>
      ))}
      <div className="err">{error}</div>
      <button className="btn" type="button" disabled={busy} onClick={submit}>Send bug report</button>
    </>
  );
}
