import Link from "next/link";
import { pilot } from "@/lib/config";
import { RECRUITER_WEEKS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const weeklyTime = [
  ["3 hours", "Hiring sessions in the product"],
  ["1 hour", "Guided recruiter missions"],
  ["30 min", "Pulse and notes"],
  ["30 min", "Check-in or interview"],
];

const flow = [
  ["0. Invite", "Open this recruiter link or enter the recruiter invite code we sent you."],
  ["1. Agreements", "Read and sign the NDA and consent form. We approve within 24 hours."],
  ["2. Access", "Get a recruiter login, read the rules, and set your portal password."],
  ["3. Test", "Company profile, jobs, Discover, and pipeline. Up to 5 hours a week."],
  ["4. Feedback", "Weekly pulse, bug reports, and the longer questionnaire."],
];

const faqs = [
  [
    "Is this a hiring contract?",
    "No. The recruiter pilot is a private product test. It is not a paid engagement, agency agreement, or commitment to hire through swypejobs after the pilot.",
  ],
  [
    "What will I see?",
    "A pre-release recruiter workspace: company setup, job posting, candidate Discover, matches, and chat. Some candidates or listings may be sample data unless we say otherwise.",
  ],
  [
    "Why sign before I get access?",
    "The product is not public. The NDA covers what you see. Step 2 stays locked until a founder checks your details and countersigns.",
  ],
  [
    "How is this different from the student pilot?",
    "Same portal steps, different invite and a recruiter app login. Students test Discover and applying. You test posting, reviewing candidates, and the hiring pipeline.",
  ],
];

export default function RecruiterLandingPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-12 md:py-16">
      <Card>
        <CardContent className="grid items-center gap-8 p-8 sm:p-10 lg:grid-cols-2 lg:gap-12 lg:p-12">
          <div className="space-y-6">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">Private · recruiters · not public</p>
            <h1 className="text-4xl sm:text-5xl">swypejobs. recruiter pilot</h1>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/portal/invite?from=recruiter">Open my recruiter invite</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Student pilot</Link>
              </Button>
            </div>
          </div>
          <div className="space-y-4 text-[15px] leading-relaxed text-muted-foreground">
            <p>
              A closed test of the hiring side of swypejobs. You use a pre-release recruiter account, post and review
              campus talent, tell us what is confusing, and help us decide what to build next.
            </p>
            <p>
              You only see the product after Step 1 is signed and a founder has approved you. Approval creates a{" "}
              <strong className="font-semibold text-foreground">recruiter</strong> login — not a student one.
            </p>
            <p>
              Up to {pilot.weeklyHours} hours a week for {pilot.testingWeeks} weeks. Spread that time however hiring
              actually works for you.
            </p>
          </div>
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
        <CardHeader>
          <CardTitle>The five steps</CardTitle>
        </CardHeader>
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
        <Card>
          <CardHeader>
            <CardTitle>What this is</CardTitle>
          </CardHeader>
          <CardContent>
            A private hiring-side test. Candidate profiles and job data may be sample unless we tell you otherwise. The
            product can have bugs, change, or reset.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>What this is not</CardTitle>
          </CardHeader>
          <CardContent>
            Not a paid recruiting engagement, agency retainer, or guarantee that you will hire through swypejobs after
            the pilot. Any later commercial arrangement needs a separate written agreement.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>What you get</CardTitle>
          </CardHeader>
          <CardContent>
            Early access when we launch employer tools, founder feedback loops, and visibility into how campus candidates
            actually behave in-product. These are not payment for work, and we may change them with notice.
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your weeks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {RECRUITER_WEEKS.map((week) => (
            <div className="grid gap-2 border-t border-border py-4 first:border-t-0 first:pt-0 sm:grid-cols-[100px_1fr]" key={week.week}>
              <strong>Week {week.week}</strong>
              <span>
                <b>{week.theme}.</b> {week.missions}
              </span>
            </div>
          ))}
          <p className="text-sm text-muted-foreground">
            Week 5 is the end-of-pilot interview. Week 6 is ours: we revoke access, thank you, and tell you what we will
            build next for employers.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-5">
        <h2 className="m-0 text-lg">Recruiter FAQ</h2>
        {faqs.map(([title, body]) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>{body}</CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div className="space-y-1">
            <p className="text-lg font-semibold tracking-tight">Have a recruiter invite code?</p>
            <p className="text-sm text-muted-foreground">
              Share this page: <code className="text-foreground">/recruiters</code>
            </p>
          </div>
          <Button asChild>
            <Link href="/portal/invite?from=recruiter">Enter invite code</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
