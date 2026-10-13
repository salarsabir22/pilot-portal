import Link from "next/link";
import { pilot } from "@/lib/config";
import { WEEKS } from "@/lib/types";

const flow = [
  ["0. Invite", "Open the private link or enter the code we sent you."],
  ["1. Agreements", "Read and sign the NDA and consent form. We approve within 24 hours."],
  ["2. Access", "Get a personal login, read the rules, and set your password."],
  ["3. Test", "Follow the weekly missions. Up to 5 hours a week."],
  ["4. Feedback", "Weekly pulse, bug reports, and the longer questionnaire."],
];

export default function HomePage() {
  return (
    <div className="page">
      <p className="kicker">Private · 25 students · not public</p>
      <div className="hero">
        <section className="card">
          <h1>Welcome to the swypejobs. pilot</h1>
          <p className="lede">
            A closed test of a swipe-based job app for students. You use a pre-release build, tell us what is confusing,
            and help us decide what to build next. You only see the product after Step 1 is signed and a founder has approved you.
          </p>
          <p className="lede">
            It takes up to {pilot.weeklyHours} hours a week for {pilot.testingWeeks} weeks. You can spread that time however you like.
          </p>
          <Link className="btn" href="/portal/invite" style={{ display: "inline-block" }}>
            Open my invite
          </Link>
        </section>
        <aside className="card">
          <h2 style={{ marginTop: 0 }}>Time each week</h2>
          <table>
            <tbody>
              <tr><td>Testing in the product</td><td>3 hours</td></tr>
              <tr><td>Guided missions</td><td>1 hour</td></tr>
              <tr><td>Pulse and notes</td><td>30 minutes</td></tr>
              <tr><td>Check-in or interview</td><td>30 minutes</td></tr>
            </tbody>
          </table>
          <p className="mute">Pulse is due {pilot.pulseDeadline}.</p>
        </aside>
      </div>

      <section className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>The five steps</h2>
        <div className="steps">
          {flow.map(([title, copy]) => (
            <div className="step-row" key={title}>
              <strong>{title}</strong>
              <span>{copy}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="cards" style={{ marginTop: 16 }}>
        <article className="card">
          <h2 style={{ marginTop: 0 }}>What this is</h2>
          <p>A private test. Job listings and employer accounts may be sample data unless we tell you otherwise. The product can have bugs, change, or reset.</p>
        </article>
        <article className="card">
          <h2 style={{ marginTop: 0 }}>What this is not</h2>
          <p>Not a job, internship, or work placement. It does not guarantee an interview, an offer, or a future role. Any later role would be a separate written agreement.</p>
        </article>
        <article className="card">
          <h2 style={{ marginTop: 0 }}>What you get</h2>
          <p>{pilot.rewards}. These are not payment for work, and we may change them with notice.</p>
        </article>
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>Your weeks</h2>
        {WEEKS.map((week) => (
          <div className="step-row" key={week.week}>
            <strong>Week {week.week}</strong>
            <span><b>{week.theme}.</b> {week.missions}</span>
          </div>
        ))}
        <p className="mute">Week 5 is the end-of-pilot interview. Week 6 is ours: we revoke access, thank you, and tell you what we will build next.</p>
      </section>
    </div>
  );
}
