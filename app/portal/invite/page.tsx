"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
        <p className="ok">You are in as {participant.id}.</p>
        <button className="btn" type="button" onClick={() => router.push(participant.status === "invited" ? "/portal/agreements" : "/portal/access")}>
          Continue
        </button>
      </>
    );
  }

  if (participant?.status === "active") {
    return (
      <>
        <h1>You are signed in</h1>
        <p className="ok">{participant.identity?.name} · {participant.id}</p>
        <button className="btn" type="button" onClick={() => router.push("/portal/test")}>Go to the test guide</button>
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
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" />
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
          <div className="err">{error}</div>
          <button className="btn" type="button" disabled={busy} onClick={signIn}>Sign in</button>
        </>
      ) : (
        <>
          <label htmlFor="code">Invite code</label>
          <input id="code" value={code} onChange={(event) => setCode(event.target.value)} placeholder="Invite code" autoComplete="off" />
          <div className="err">{error}</div>
          <button className="btn" type="button" disabled={busy} onClick={openInvite}>Open my invite</button>
          {demo ? (
            <p className="mute" style={{ marginTop: 12 }}>
              Demo code: <code>SJ-DEMO</code>. Spare codes: <code>SJ-INVITE-02</code>, <code>SJ-INVITE-03</code>.
            </p>
          ) : null}
        </>
      )}
    </>
  );
}
