"use client";

import Link from "next/link";
import { usePilot } from "@/components/pilot-context";
import { pilot } from "@/lib/config";

export default function FeedbackHub() {
  const { participant, ready } = usePilot();
  if (!ready) return <p className="mute">Loading…</p>;
  if (participant?.status !== "active") {
    return <p>Feedback opens after your first sign-in. <Link href="/portal/access">Go to access</Link></p>;
  }
  const done = participant.pulses.length;
  const mid = participant.questionnaires.find((item) => item.mode === "mid")?.status;
  const end = participant.questionnaires.find((item) => item.mode === "end")?.status;
  return (
    <>
      <h1>Step 4 of 4: Feedback hub</h1>
      <p>Pulses done: <b>{done} of 4</b>. Due {pilot.pulseDeadline}.</p>
      <div className="bar" role="progressbar" aria-valuenow={done * 25} aria-valuemin={0} aria-valuemax={100}>
        <span style={{ width: `${done * 25}%` }} />
      </div>
      <p className="mute">
        Mid-pilot questionnaire: {mid === "submitted" ? "submitted" : mid === "draft" ? "in progress" : "not started"}.
        {" "}End-of-pilot questionnaire: {end === "submitted" ? "submitted" : end === "draft" ? "in progress" : "not started"}.
        {" "}Join swypejobs.: {participant.join ? participant.join.interest : "not answered"}.
      </p>
      <div className="cards">
        <article className="box">
          <b>Weekly pulse survey</b>
          <p className="mute">3 minutes. Due {pilot.pulseDeadline}.</p>
          <Link className="btn" href="/portal/feedback/pulse">Open</Link>
        </article>
        <article className="box">
          <b>Report a bug</b>
          <p className="mute">Words only, no screenshots.</p>
          <Link className="btn" href="/portal/feedback/bug">Open</Link>
        </article>
        <article className="box">
          <b>Pilot feedback questionnaire</b>
          <p className="mute">Week 2: sections A to E. Week 4: all sections. About 25 to 30 minutes.</p>
          <Link className="btn" href="/portal/feedback/questionnaire">Open</Link>
        </article>
        <article className="box">
          <b>Would you like to be part of swypejobs.?</b>
          <p className="mute">Optional. Last section of the questionnaire, also on its own.</p>
          <Link className="btn" href="/portal/feedback/join">Open</Link>
        </article>
      </div>
    </>
  );
}
