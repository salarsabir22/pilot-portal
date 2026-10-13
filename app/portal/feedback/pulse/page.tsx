"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, usePilot } from "@/components/pilot-context";
import { BLOCKERS, DEVICES, DISAPPOINTED, HOURS, PULSE_STATEMENTS } from "@/lib/questions";

const empty = {
  week: "1",
  device: DEVICES[0],
  hours: HOURS[2],
  days: "3",
  ratings: [3, 3, 3, 3, 3, 3],
  disappointed: DISAPPOINTED[1],
  best: "",
  frustrating: "",
  fixFirst: "",
  confused: "",
  expectedMiss: "",
  match: "No",
  conversation: "",
  noMatchWhy: "",
  hitBug: "No",
  bugScreen: "",
  bugSteps: "",
  bugExpected: "",
  bugTime: "",
  blocker: BLOCKERS[0],
  nextAsk: "",
  anythingElse: "",
};

export default function PulsePage() {
  const { participant, ready, refresh } = usePilot();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const existing = useMemo(
    () => participant?.pulses.find((item) => item.week === Number(form.week)),
    [participant, form.week],
  );

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit() {
    setBusy(true);
    setError("");
    try {
      await api("/api/feedback", { kind: "pulse", ...form, week: Number(form.week), ratings: form.ratings });
      await refresh();
      router.push("/portal/feedback");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the pulse.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return <p className="mute">Loading…</p>;
  if (participant?.status !== "active") return <p>Sign in first. <Link href="/portal/access">Access</Link></p>;

  return (
    <>
      <Link className="btn alt" href="/portal/feedback" style={{ marginTop: 0 }}>Back</Link>
      <h1>Weekly pulse</h1>
      <p className="mute">About 3 minutes. Honest and critical is more useful than polite. Do not attach screenshots. Describe things in words. {existing ? "You already sent this week. Sending again replaces it." : ""}</p>
      <label htmlFor="week">Which week of the pilot is this?</label>
      <select id="week" value={form.week} onChange={(event) => set("week", event.target.value)}>
        {[1, 2, 3, 4].map((week) => <option key={week}>{week}</option>)}
      </select>
      <label htmlFor="device">Which device did you mainly use?</label>
      <select id="device" value={form.device} onChange={(event) => set("device", event.target.value)}>
        {DEVICES.map((item) => <option key={item}>{item}</option>)}
      </select>
      <label htmlFor="hours">Roughly how many hours did you spend testing this week?</label>
      <select id="hours" value={form.hours} onChange={(event) => set("hours", event.target.value)}>
        {HOURS.map((item) => <option key={item}>{item}</option>)}
      </select>
      <label htmlFor="days">On how many different days did you use it?</label>
      <select id="days" value={form.days} onChange={(event) => set("days", event.target.value)}>
        {Array.from({ length: 8 }, (_, day) => <option key={day}>{day}</option>)}
      </select>
      <h2>Rate 1 (strongly disagree) to 5 (strongly agree)</h2>
      {PULSE_STATEMENTS.map((statement, index) => (
        <div key={statement}>
          <label htmlFor={`r${index}`}>{statement}</label>
          <select
            id={`r${index}`}
            value={form.ratings[index]}
            onChange={(event) => set("ratings", form.ratings.map((value, i) => (i === index ? Number(event.target.value) : value)))}
          >
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      ))}
      <label htmlFor="disappointed">How would you feel if you could no longer use this?</label>
      <select id="disappointed" value={form.disappointed} onChange={(event) => set("disappointed", event.target.value)}>
        {DISAPPOINTED.map((item) => <option key={item}>{item}</option>)}
      </select>
      <Text label="What was the best moment you had this week?" value={form.best} onChange={(value) => set("best", value)} />
      <Text label="What was the most frustrating moment?" value={form.frustrating} onChange={(value) => set("frustrating", value)} />
      <Text label="What is one thing we should fix first?" value={form.fixFirst} onChange={(value) => set("fixFirst", value)} />
      <Text label="Did anything confuse you, or make you stop and think “wait, what?” Where?" value={form.confused} onChange={(value) => set("confused", value)} />
      <Text label="What did you expect to happen that did not?" value={form.expectedMiss} onChange={(value) => set("expectedMiss", value)} />
      <label htmlFor="match">Did you get a match this week?</label>
      <select id="match" value={form.match} onChange={(event) => set("match", event.target.value)}>
        <option>Yes</option>
        <option>No</option>
        <option>Not sure</option>
      </select>
      {form.match === "Yes" ? <Text label="Did a conversation start? How did it go?" value={form.conversation} onChange={(value) => set("conversation", value)} /> : null}
      {form.match === "No" ? <Text label="What do you think got in the way?" value={form.noMatchWhy} onChange={(value) => set("noMatchWhy", value)} /> : null}
      <label htmlFor="hitBug">Did you hit a bug or something broken?</label>
      <select id="hitBug" value={form.hitBug} onChange={(event) => set("hitBug", event.target.value)}>
        <option>No</option>
        <option>Yes</option>
      </select>
      {form.hitBug === "Yes" ? (
        <>
          <Text label="Which screen or page were you on?" value={form.bugScreen} onChange={(value) => set("bugScreen", value)} />
          <Text label="What did you do just before it happened?" value={form.bugSteps} onChange={(value) => set("bugSteps", value)} />
          <Text label="What did you expect, and what happened instead?" value={form.bugExpected} onChange={(value) => set("bugExpected", value)} />
          <Text label="Roughly what date and time was it?" value={form.bugTime} onChange={(value) => set("bugTime", value)} />
        </>
      ) : null}
      <label htmlFor="blocker">Was anything stopping you from using it as much as you wanted?</label>
      <select id="blocker" value={form.blocker} onChange={(event) => set("blocker", event.target.value)}>
        {BLOCKERS.map((item) => <option key={item}>{item}</option>)}
      </select>
      <Text label="Is there anything you want us to ask or look at next week?" value={form.nextAsk} onChange={(value) => set("nextAsk", value)} />
      <Text label="Anything else on your mind?" value={form.anythingElse} onChange={(value) => set("anythingElse", value)} />
      <div className="err">{error}</div>
      <button className="btn" type="button" disabled={busy} onClick={submit}>Submit pulse</button>
    </>
  );
}

function Text({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <>
      <label>{label}</label>
      <textarea rows={3} value={value} onChange={(event) => onChange(event.target.value)} />
    </>
  );
}
