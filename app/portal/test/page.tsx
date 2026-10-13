"use client";

import Link from "next/link";
import { useState } from "react";
import { usePilot } from "@/components/pilot-context";
import { RULES, WEEKS } from "@/lib/types";

export default function TestPage() {
  const { participant, ready } = usePilot();
  const [week, setWeek] = useState(1);
  if (!ready) return <p className="mute">Loading…</p>;
  if (participant?.status !== "active") {
    return <p>The test guide opens after your first sign-in. <Link href="/portal/access">Go to access</Link></p>;
  }
  const current = WEEKS[week] ?? WEEKS[1];
  return (
    <>
      <h1>Step 3 of 4: Test guide</h1>
      <p>Up to 5 hours a week. Pick a week to see its missions.</p>
      <div className="tabs">
        {WEEKS.map((item) => (
          <button key={item.week} className="chip" type="button" aria-pressed={item.week === week} onClick={() => setWeek(item.week)}>
            Week {item.week}
          </button>
        ))}
      </div>
      <div className="box">
        <b>Week {current.week}: {current.theme}</b>
        <p style={{ marginTop: 6 }}>{current.missions}</p>
      </div>
      <h2>Time budget</h2>
      <table>
        <tbody>
          <tr><td>Testing sessions</td><td>3 hours</td></tr>
          <tr><td>Guided missions</td><td>1 hour</td></tr>
          <tr><td>Weekly pulse and written notes</td><td>30 minutes</td></tr>
          <tr><td>Check-in call or interview</td><td>30 minutes</td></tr>
        </tbody>
      </table>
      <h2>What not to do</h2>
      <ul>
        {RULES.slice(0, 4).map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
      <Link className="btn" href="/portal/feedback">Go to Step 4: Feedback</Link>
    </>
  );
}
