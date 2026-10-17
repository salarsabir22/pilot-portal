import Link from "next/link";
import { pilot } from "@/lib/config";
import { RECRUITER_WEEKS, WEEKS } from "@/lib/types";
import { TutorialVideo } from "@/components/tutorial-video";
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
  ["2. Access", "Get a personal login for your role, read the rules, and set your password."],
  ["3. Test", "Follow the weekly missions for your audience. Up to 5 hours a week."],
  ["4. Feedback", "Weekly pulse, bug reports, and the longer questionnaire."],
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-12 md:py-16">
      <Card>
        <CardContent className="grid items-center gap-8 p-8 sm:p-10 lg:grid-cols-2 lg:gap-12 lg:p-12">
          <div className="space-y-6">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">Private · students & recruiters · not public</p>
            <h1 className="text-4xl sm:text-5xl">Welcome to the swypejobs. pilot</h1>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/portal/invite">Open my invite</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="#audiences">Students & recruiters</Link>
              </Button>
            </div>
          </div>
          <div className="space-y-4 text-[15px] leading-relaxed text-muted-foreground">
            <p>
              A closed test of a swipe-based campus hiring product. Students and recruiters use the same portal steps;
              your invite decides which app login you get after approval.
            </p>
            <p>
              You only see the product after Step 1 is signed and a founder has approved you. It takes up to{" "}
              {pilot.weeklyHours} hours a week for {pilot.testingWeeks} weeks.
            </p>
          </div>
        </CardContent>
      </Card>

      <div id="audiences" className="grid scroll-mt-24 items-stretch gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>For students</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-[15px] leading-relaxed text-muted-foreground">
            <p>
              Test Discover, profile setup, matches, and chat. Tell us what confuses you and what would make you keep
              using it.
            </p>
            <p>Approval creates a <strong className="font-semibold text-foreground">student</strong> app login.</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Build a profile and swipe jobs</li>
              <li>Aim for a match and start a conversation</li>
              <li>Compare it with how you search today</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>For recruiters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-[15px] leading-relaxed text-muted-foreground">
            <p>
              Test company setup, job posting, candidate Discover, shortlisting, and pipeline chat. Tell us what would
              make hiring here trustworthy.
            </p>
            <p>Approval creates a <strong className="font-semibold text-foreground">recruiter</strong> app login.</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Finish company profile and post a job</li>
              <li>Review candidates and shortlist or pass</li>
              <li>Compare it with your current hiring tools</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="m-0 text-lg">How the pilot page works</h2>
          <p className="text-sm text-muted-foreground">About two minutes.</p>
        </div>
        <TutorialVideo />
      </div>

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
            A private test. Job listings, candidates, and employer accounts may be sample data unless we tell you
            otherwise. The product can have bugs, change, or reset.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>What this is not</CardTitle>
          </CardHeader>
          <CardContent>
            Not a job, internship, work placement, or paid recruiting engagement. It does not guarantee an interview,
            hire, or future commercial relationship. Any later arrangement needs a separate written agreement.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>What you get</CardTitle>
          </CardHeader>
          <CardContent>
            {pilot.rewards}. These are not payment for work, and we may change them with notice.
          </CardContent>
        </Card>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Student weeks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {WEEKS.map((week) => (
              <div className="grid gap-2 border-t border-border py-4 first:border-t-0 first:pt-0 sm:grid-cols-[100px_1fr]" key={week.week}>
                <strong>Week {week.week}</strong>
                <span>
                  <b>{week.theme}.</b> {week.missions}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recruiter weeks</CardTitle>
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
          </CardContent>
        </Card>
      </div>

      <p className="text-sm text-muted-foreground">
        Week 5 is the end-of-pilot interview for both audiences. Week 6 is ours: we revoke access, thank you, and tell
        you what we will build next.
      </p>

      <Card>
        <CardContent className="flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div className="space-y-1">
            <p className="text-lg font-semibold tracking-tight">Have an invite code?</p>
            <p className="text-sm text-muted-foreground">Student and recruiter codes both open from the same invite page.</p>
          </div>
          <Button asChild>
            <Link href="/portal/invite">Enter invite code</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
