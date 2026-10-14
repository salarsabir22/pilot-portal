"use client";

import Link from "next/link";
import { usePilot } from "@/components/pilot-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { pilot } from "@/lib/config";

export default function FeedbackHub() {
  const { participant, ready } = usePilot();
  if (!ready) return <p className="text-sm text-muted-foreground">Loading…</p>;
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
      <Progress value={done * 25} />
      <p className="text-sm text-muted-foreground">
        Mid-pilot questionnaire: {mid === "submitted" ? "submitted" : mid === "draft" ? "in progress" : "not started"}.
        {" "}End-of-pilot questionnaire: {end === "submitted" ? "submitted" : end === "draft" ? "in progress" : "not started"}.
        {" "}Join swypejobs.: {participant.join ? participant.join.interest : "not answered"}.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          ["/portal/feedback/pulse", "Weekly pulse survey", `3 minutes. Due ${pilot.pulseDeadline}.`],
          ["/portal/feedback/bug", "Report a bug", "Words only, no screenshots."],
          ["/portal/feedback/questionnaire", "Pilot feedback questionnaire", "Week 2: sections A to E. Week 4: all sections. About 25 to 30 minutes."],
          ["/portal/feedback/join", "Would you like to be part of swypejobs.?", "Optional. Last section of the questionnaire, also on its own."],
        ].map(([href, title, copy]) => (
          <Card key={href} className="flex h-full flex-col p-5">
            <p className="font-semibold">{title}</p>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{copy}</p>
            <Button className="mt-4 w-fit" asChild><Link href={href}>Open</Link></Button>
          </Card>
        ))}
      </div>
    </>
  );
}
