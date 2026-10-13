"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, usePilot } from "@/components/pilot-context";
import { BLOCKERS, DEVICES, DISAPPOINTED, HOURS, PULSE_STATEMENTS } from "@/lib/questions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { OptionSelect } from "@/components/ui/option-select";
import { Textarea } from "@/components/ui/textarea";

const empty = {
  week: "1",
  device: DEVICES[0],
  hours: HOURS[2],
  days: "3",
  ratings: [3, 3, 3, 3, 3, 3],
  disappointed: DISAPPOINTED[1],
  best: "",
  frustrating: "",
  fixFirst: "",
  confused: "",
  expectedMiss: "",
  match: "No",
  conversation: "",
  noMatchWhy: "",
  hitBug: "No",
  bugScreen: "",
  bugSteps: "",
  bugExpected: "",
  bugTime: "",
  blocker: BLOCKERS[0],
  nextAsk: "",
  anythingElse: "",
};

export default function PulsePage() {
  const { participant, ready, refresh } = usePilot();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const existing = useMemo(
    () => participant?.pulses.find((item) => item.week === Number(form.week)),
    [participant, form.week],
  );

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit() {
    setBusy(true);
    setError("");
    try {
      await api("/api/feedback", { kind: "pulse", ...form, week: Number(form.week), ratings: form.ratings });
      await refresh();
      router.push("/portal/feedback");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the pulse.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (participant?.status !== "active") return <p>Sign in first. <Link href="/portal/access">Access</Link></p>;

  return (
    <>
      <Button variant="outline" asChild><Link href="/portal/feedback">Back</Link></Button>
      <h1 className="mt-4">Weekly pulse</h1>
      <p className="text-sm text-muted-foreground">About 3 minutes. Honest and critical is more useful than polite. Do not attach screenshots. Describe things in words. {existing ? "You already sent this week. Sending again replaces it." : ""}</p>
      <Label htmlFor="week">Which week of the pilot is this?</Label>
      <OptionSelect id="week" value={form.week} onValueChange={(value) => set("week", value)} options={["1", "2", "3", "4"]} />
      <Label htmlFor="device" className="mt-3">Which device did you mainly use?</Label>
      <OptionSelect id="device" value={form.device} onValueChange={(value) => set("device", value)} options={DEVICES} />
      <Label htmlFor="hours" className="mt-3">Roughly how many hours did you spend testing this week?</Label>
      <OptionSelect id="hours" value={form.hours} onValueChange={(value) => set("hours", value)} options={HOURS} />
      <Label htmlFor="days" className="mt-3">On how many different days did you use it?</Label>
      <OptionSelect id="days" value={form.days} onValueChange={(value) => set("days", value)} options={["0", "1", "2", "3", "4", "5", "6", "7"]} />
      <h2>Rate 1 (strongly disagree) to 5 (strongly agree)</h2>
      {PULSE_STATEMENTS.map((statement, index) => (
        <div key={statement} className="mt-3">
          <Label htmlFor={`r${index}`}>{statement}</Label>
          <OptionSelect
            id={`r${index}`}
            value={String(form.ratings[index])}
            onValueChange={(value) => set("ratings", form.ratings.map((item, i) => (i === index ? Number(value) : item)))}
            options={["1", "2", "3", "4", "5"]}
          />
        </div>
      ))}
      <Label htmlFor="disappointed" className="mt-3">How would you feel if you could no longer use this?</Label>
      <OptionSelect id="disappointed" value={form.disappointed} onValueChange={(value) => set("disappointed", value)} options={DISAPPOINTED} />
      <Text label="What was the best moment you had this week?" value={form.best} onValueChange={(value) => set("best", value)} />
      <Text label="What was the most frustrating moment?" value={form.frustrating} onValueChange={(value) => set("frustrating", value)} />
      <Text label="What is one thing we should fix first?" value={form.fixFirst} onValueChange={(value) => set("fixFirst", value)} />
      <Text label="Did anything confuse you, or make you stop and think “wait, what?” Where?" value={form.confused} onValueChange={(value) => set("confused", value)} />
      <Text label="What did you expect to happen that did not?" value={form.expectedMiss} onValueChange={(value) => set("expectedMiss", value)} />
      <Label htmlFor="match" className="mt-3">Did you get a match this week?</Label>
      <OptionSelect id="match" value={form.match} onValueChange={(value) => set("match", value)} options={["Yes", "No", "Not sure"]} />
      {form.match === "Yes" ? <Text label="Did a conversation start? How did it go?" value={form.conversation} onValueChange={(value) => set("conversation", value)} /> : null}
      {form.match === "No" ? <Text label="What do you think got in the way?" value={form.noMatchWhy} onValueChange={(value) => set("noMatchWhy", value)} /> : null}
      <Label htmlFor="hitBug" className="mt-3">Did you hit a bug or something broken?</Label>
      <OptionSelect id="hitBug" value={form.hitBug} onValueChange={(value) => set("hitBug", value)} options={["No", "Yes"]} />
      {form.hitBug === "Yes" ? (
        <>
          <Text label="Which screen or page were you on?" value={form.bugScreen} onValueChange={(value) => set("bugScreen", value)} />
          <Text label="What did you do just before it happened?" value={form.bugSteps} onValueChange={(value) => set("bugSteps", value)} />
          <Text label="What did you expect, and what happened instead?" value={form.bugExpected} onValueChange={(value) => set("bugExpected", value)} />
          <Text label="Roughly what date and time was it?" value={form.bugTime} onValueChange={(value) => set("bugTime", value)} />
        </>
      ) : null}
      <Label htmlFor="blocker" className="mt-3">Was anything stopping you from using it as much as you wanted?</Label>
      <OptionSelect id="blocker" value={form.blocker} onValueChange={(value) => set("blocker", value)} options={BLOCKERS} />
      <Text label="Is there anything you want us to ask or look at next week?" value={form.nextAsk} onValueChange={(value) => set("nextAsk", value)} />
      <Text label="Anything else on your mind?" value={form.anythingElse} onValueChange={(value) => set("anythingElse", value)} />
      <p className="mt-2 text-sm text-destructive">{error}</p>
      <Button className="mt-4" type="button" disabled={busy} onClick={submit}>Submit pulse</Button>
    </>
  );
}

function Text({ label, value, onValueChange }: { label: string; value: string; onValueChange: (value: string) => void }) {
  return (
    <div className="mt-3 space-y-2">
      <Label>{label}</Label>
      <Textarea rows={3} value={value} onChange={(event) => onValueChange(event.target.value)} />
    </div>
  );
}
