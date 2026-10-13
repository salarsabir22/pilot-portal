"use client";

import Link from "next/link";
import { useState } from "react";
import { usePilot } from "@/components/pilot-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableCell, TableRow } from "@/components/ui/table";
import { RULES, WEEKS } from "@/lib/types";

export default function TestPage() {
  const { participant, ready } = usePilot();
  const [week, setWeek] = useState(1);
  if (!ready) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (participant?.status !== "active") {
    return <p>The test guide opens after your first sign-in. <Link href="/portal/access">Go to access</Link></p>;
  }
  const current = WEEKS[week] ?? WEEKS[1];
  return (
    <>
      <h1>Step 3 of 4: Test guide</h1>
      <p>Up to 5 hours a week. Pick a week to see its missions.</p>
      <div className="flex flex-wrap gap-2">
        {WEEKS.map((item) => (
          <Button key={item.week} variant={item.week === week ? "default" : "outline"} size="sm" type="button" aria-pressed={item.week === week} onClick={() => setWeek(item.week)}>
            Week {item.week}
          </Button>
        ))}
      </div>
      <Card className="p-4">
        <b>Week {current.week}: {current.theme}</b>
        <p className="mt-2">{current.missions}</p>
      </Card>
      <h2>Time budget</h2>
      <Table>
        <tbody>
          <TableRow><TableCell>Testing sessions</TableCell><TableCell>3 hours</TableCell></TableRow>
          <TableRow><TableCell>Guided missions</TableCell><TableCell>1 hour</TableCell></TableRow>
          <TableRow><TableCell>Weekly pulse and written notes</TableCell><TableCell>30 minutes</TableCell></TableRow>
          <TableRow><TableCell>Check-in call or interview</TableCell><TableCell>30 minutes</TableCell></TableRow>
        </tbody>
      </Table>
      <h2>What not to do</h2>
      <ul>
        {RULES.slice(0, 4).map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
      <Button className="mt-4" asChild><Link href="/portal/feedback">Go to Step 4: Feedback</Link></Button>
    </>
  );
}
