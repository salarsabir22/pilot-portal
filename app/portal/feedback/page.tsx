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
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Card className="p-4">
          <b>Weekly pulse survey</b>
          <p className="text-sm text-muted-foreground">3 minutes. Due {pilot.pulseDeadline}.</p>
          <Button className="mt-2" asChild><Link href="/portal/feedback/pulse">Open</Link></Button>
        </Card>
        <Card className="p-4">
          <b>Report a bug</b>
          <p className="text-sm text-muted-foreground">Words only, no screenshots.</p>
          <Button className="mt-2" asChild><Link href="/portal/feedback/bug">Open</Link></Button>
        </Card>
        <Card className="p-4">
          <b>Pilot feedback questionnaire</b>
          <p className="text-sm text-muted-foreground">Week 2: sections A to E. Week 4: all sections. About 25 to 30 minutes.</p>
          <Button className="mt-2" asChild><Link href="/portal/feedback/questionnaire">Open</Link></Button>
        </Card>
        <Card className="p-4">
          <b>Would you like to be part of swypejobs.?</b>
          <p className="text-sm text-muted-foreground">Optional. Last section of the questionnaire, also on its own.</p>
          <Button className="mt-2" asChild><Link href="/portal/feedback/join">Open</Link></Button>
        </Card>
      </div>
    </>
  );
}
