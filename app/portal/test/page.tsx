"use client";

import Link from "next/link";
import { useState } from "react";
import { usePilot } from "@/components/pilot-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RULES, WEEKS } from "@/lib/types";

const weeklyTime = [
  ["3 hours", "Testing sessions"],
  ["1 hour", "Guided missions"],
  ["30 min", "Pulse and notes"],
  ["30 min", "Check-in or interview"],
];

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
      <Card>
        <CardContent className="p-5 pt-5 sm:p-5 sm:pt-5">
          <p className="font-semibold">Week {current.week}: {current.theme}</p>
          <p className="mt-2">{current.missions}</p>
        </CardContent>
      </Card>
      <h2>Time budget</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {weeklyTime.map(([time, label]) => (
          <Card key={label}>
            <CardContent className="p-5 pt-5 sm:p-5 sm:pt-5">
              <p className="text-2xl font-extrabold tracking-tight">{time}</p>
              <p className="mt-1 text-sm text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
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
