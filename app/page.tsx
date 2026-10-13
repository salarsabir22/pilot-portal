import Link from "next/link";
import { pilot } from "@/lib/config";
import { WEEKS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableCell, TableRow } from "@/components/ui/table";

const flow = [
  ["0. Invite", "Open the private link or enter the code we sent you."],
  ["1. Agreements", "Read and sign the NDA and consent form. We approve within 24 hours."],
  ["2. Access", "Get a personal login, read the rules, and set your password."],
  ["3. Test", "Follow the weekly missions. Up to 5 hours a week."],
  ["4. Feedback", "Weekly pulse, bug reports, and the longer questionnaire."],
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-4 px-5 py-8">
      <p className="text-xs font-bold uppercase tracking-wide text-primary">Private · 25 students · not public</p>
      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-extrabold">Welcome to the swypejobs. pilot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-[15px] leading-relaxed">
            <p>
              A closed test of a swipe-based job app for students. You use a pre-release build, tell us what is confusing,
              and help us decide what to build next. You only see the product after Step 1 is signed and a founder has approved you.
            </p>
            <p>It takes up to {pilot.weeklyHours} hours a week for {pilot.testingWeeks} weeks. You can spread that time however you like.</p>
            <Button asChild><Link href="/portal/invite">Open my invite</Link></Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Time each week</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <tbody>
                <TableRow><TableCell>Testing in the product</TableCell><TableCell>3 hours</TableCell></TableRow>
                <TableRow><TableCell>Guided missions</TableCell><TableCell>1 hour</TableCell></TableRow>
                <TableRow><TableCell>Pulse and notes</TableCell><TableCell>30 minutes</TableCell></TableRow>
                <TableRow><TableCell>Check-in or interview</TableCell><TableCell>30 minutes</TableCell></TableRow>
              </tbody>
            </Table>
            <p className="mt-3 text-sm text-muted-foreground">Pulse is due {pilot.pulseDeadline}.</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>The five steps</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {flow.map(([title, copy]) => (
            <div className="grid gap-2 border-t border-border pt-3 sm:grid-cols-[110px_1fr]" key={title}>
              <strong>{title}</strong>
              <span>{copy}</span>
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle>What this is</CardTitle></CardHeader><CardContent>A private test. Job listings and employer accounts may be sample data unless we tell you otherwise. The product can have bugs, change, or reset.</CardContent></Card>
        <Card><CardHeader><CardTitle>What this is not</CardTitle></CardHeader><CardContent>Not a job, internship, or work placement. It does not guarantee an interview, an offer, or a future role. Any later role would be a separate written agreement.</CardContent></Card>
        <Card><CardHeader><CardTitle>What you get</CardTitle></CardHeader><CardContent>{pilot.rewards}. These are not payment for work, and we may change them with notice.</CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Your weeks</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {WEEKS.map((week) => (
            <div className="grid gap-2 border-t border-border pt-3 sm:grid-cols-[90px_1fr]" key={week.week}>
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
