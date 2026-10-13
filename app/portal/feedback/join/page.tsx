"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { api, usePilot } from "@/components/pilot-context";
import { JOIN_CAPACITIES } from "@/lib/questions";

export default function JoinPage() {
  const { participant, ready, refresh } = usePilot();
  const [interest, setInterest] = useState(participant?.join?.interest || "Yes");
  const [capacities, setCapacities] = useState<string[]>(participant?.join?.capacities || []);
  const [other, setOther] = useState(participant?.join?.other || "");
  const [why, setWhy] = useState(participant?.join?.why || "");
  const [skills, setSkills] = useState(participant?.join?.skills || "");
  const [hours, setHours] = useState(participant?.join?.hours || "");
  const [worthwhile, setWorthwhile] = useState(participant?.join?.worthwhile || "");
  const [know, setKnow] = useState(participant?.join?.know || "");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const saved = useMemo(() => participant?.join, [participant]);

  function toggle(item: string) {
    setCapacities((current) => (current.includes(item) ? current.filter((value) => value !== item) : current.concat(item)));
  }

  async function submit() {
    setBusy(true);
    setError("");
    try {
      await api("/api/feedback", { kind: "join", interest, capacities, other, why, skills, hours, worthwhile, know });
      await refresh();
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save that.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return <p className="mute">Loading…</p>;
  if (participant?.status !== "active") return <p>Sign in first. <Link href="/portal/access">Access</Link></p>;

  return (
    <>
      <Link className="btn alt" href="/portal/feedback" style={{ marginTop: 0 }}>Back</Link>
      <h1>Would you like to be part of swypejobs.?</h1>
      <p className="mute">Optional. It has no effect on how we treat your other feedback. Saying yes is an expression of interest only. It is not an offer, and it does not create any obligation on either side. We reply within a week if we want to talk.</p>
      {saved ? <p className="ok">Saved answer: {saved.interest}</p> : null}
      {done ? <p className="ok">Thank you. We will contact you only if we would like to talk.</p> : null}
      <label htmlFor="interest">Would you like to be part of swypejobs.?</label>
      <select id="interest" value={interest} onChange={(event) => setInterest(event.target.value)}>
        <option>Yes</option>
        <option>Maybe, tell me more</option>
        <option>No, thanks</option>
      </select>
      {interest === "No, thanks" ? null : (
        <>
          <p>In what capacity? Pick all that apply.</p>
          {JOIN_CAPACITIES.map((item) => (
            <label className="cb" key={item}>
              <input type="checkbox" checked={capacities.includes(item)} onChange={() => toggle(item)} />
              {item}
            </label>
          ))}
          <label htmlFor="other">If something else, what?</label>
          <input id="other" value={other} onChange={(event) => setOther(event.target.value)} />
          <label htmlFor="why">Why do you think you would be a great fit?</label>
          <textarea id="why" rows={4} value={why} onChange={(event) => setWhy(event.target.value)} />
          <label htmlFor="skills">What skills, experience or projects would you bring?</label>
          <textarea id="skills" rows={3} value={skills} onChange={(event) => setSkills(event.target.value)} />
          <label htmlFor="hours">How many hours a week could you realistically commit, and from when?</label>
          <input id="hours" value={hours} onChange={(event) => setHours(event.target.value)} />
          <label htmlFor="worthwhile">What would make it worthwhile for you?</label>
          <textarea id="worthwhile" rows={3} value={worthwhile} onChange={(event) => setWorthwhile(event.target.value)} />
          <label htmlFor="know">Is there anything we should know before we talk?</label>
          <textarea id="know" rows={3} value={know} onChange={(event) => setKnow(event.target.value)} />
        </>
      )}
      <div className="err">{error}</div>
      <button className="btn" type="button" disabled={busy} onClick={submit}>Submit</button>
    </>
  );
}
