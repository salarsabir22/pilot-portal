import Link from "next/link";
import { pilot } from "@/lib/config";
import { WEEKS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const weeklyTime = [
  ["3 hours", "Testing in the product"],
  ["1 hour", "Guided missions"],
  ["30 min", "Pulse and notes"],
  ["30 min", "Check-in or interview"],
];

const flow = [
  ["0. Invite", "Open the private link or enter the code we sent you."],
  ["1. Agreements", "Read and sign the NDA and consent form. We approve within 24 hours."],
  ["2. Access", "Get a personal login, read the rules, and set your password."],
  ["3. Test", "Follow the weekly missions. Up to 5 hours a week."],
  ["4. Feedback", "Weekly pulse, bug reports, and the longer questionnaire."],
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-12 md:py-16">
      <Card>
        <CardHeader className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wide text-primary">Private · 25 students · not public</p>
          <CardTitle className="max-w-xl text-3xl font-extrabold sm:text-4xl">Welcome to the swypejobs. pilot</CardTitle>
        </CardHeader>
        <CardContent className="max-w-2xl space-y-5 text-[15px] leading-relaxed">
          <p>
            A closed test of a swipe-based job app for students. You use a pre-release build, tell us what is confusing,
            and help us decide what to build next. You only see the product after Step 1 is signed and a founder has approved you.
          </p>
          <p>It takes up to {pilot.weeklyHours} hours a week for {pilot.testingWeeks} weeks. You can spread that time however you like.</p>
          <Button asChild><Link href="/portal/invite">Open my invite</Link></Button>
        </CardContent>
      </Card>
      <div className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="m-0 text-lg">Time each week</h2>
          <p className="text-sm text-muted-foreground">Pulse is due {pilot.pulseDeadline}.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {weeklyTime.map(([time, label]) => (
            <Card key={label}>
              <CardContent className="p-5 pt-5 sm:p-5 sm:pt-5">
                <p className="text-2xl font-extrabold tracking-tight">{time}</p>
                <p className="mt-1 text-sm text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle>The five steps</CardTitle></CardHeader>
        <CardContent className="space-y-0">
          {flow.map(([title, copy]) => (
            <div className="grid gap-2 border-t border-border py-4 first:border-t-0 first:pt-0 sm:grid-cols-[140px_1fr]" key={title}>
              <strong>{title}</strong>
              <span>{copy}</span>
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="grid items-start gap-6 md:grid-cols-3">
        <Card><CardHeader><CardTitle>What this is</CardTitle></CardHeader><CardContent>A private test. Job listings and employer accounts may be sample data unless we tell you otherwise. The product can have bugs, change, or reset.</CardContent></Card>
        <Card><CardHeader><CardTitle>What this is not</CardTitle></CardHeader><CardContent>Not a job, internship, or work placement. It does not guarantee an interview, an offer, or a future role. Any later role would be a separate written agreement.</CardContent></Card>
        <Card><CardHeader><CardTitle>What you get</CardTitle></CardHeader><CardContent>{pilot.rewards}. These are not payment for work, and we may change them with notice.</CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Your weeks</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          {WEEKS.map((week) => (
            <div className="grid gap-2 border-t border-border py-4 first:border-t-0 first:pt-0 sm:grid-cols-[100px_1fr]" key={week.week}>
              <strong>Week {week.week}</strong>
              <span><b>{week.theme}.</b> {week.missions}</span>
            </div>
          ))}
          <p className="text-sm text-muted-foreground">Week 5 is the end-of-pilot interview. Week 6 is ours: we revoke access, thank you, and tell you what we will build next.</p>
        </CardContent>
      </Card>
    </div>
  );
}
