"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { api, usePilot } from "@/components/pilot-context";
import { JOIN_CAPACITIES } from "@/lib/questions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OptionSelect } from "@/components/ui/option-select";
import { Textarea } from "@/components/ui/textarea";

export default function JoinPage() {
  const { participant, ready, refresh } = usePilot();
  const [interest, setInterest] = useState(participant?.join?.interest || "Yes");
  const [capacities, setCapacities] = useState<string[]>(participant?.join?.capacities || []);
  const [other, setOther] = useState(participant?.join?.other || "");
  const [why, setWhy] = useState(participant?.join?.why || "");
  const [skills, setSkills] = useState(participant?.join?.skills || "");
  const [hours, setHours] = useState(participant?.join?.hours || "");
  const [worthwhile, setWorthwhile] = useState(participant?.join?.worthwhile || "");
  const [know, setKnow] = useState(participant?.join?.know || "");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const saved = useMemo(() => participant?.join, [participant]);

  function toggle(item: string) {
    setCapacities((current) => (current.includes(item) ? current.filter((value) => value !== item) : current.concat(item)));
  }

  async function submit() {
    setBusy(true);
    setError("");
    try {
      await api("/api/feedback", { kind: "join", interest, capacities, other, why, skills, hours, worthwhile, know });
      await refresh();
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save that.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (participant?.status !== "active") return <p>Sign in first. <Link href="/portal/access">Access</Link></p>;

  return (
    <>
      <Button variant="outline" asChild><Link href="/portal/feedback">Back</Link></Button>
      <h1 className="mt-4">Would you like to be part of swypejobs.?</h1>
      <p className="text-sm text-muted-foreground">Optional. It has no effect on how we treat your other feedback. Saying yes is an expression of interest only. It is not an offer, and it does not create any obligation on either side. We reply within a week if we want to talk.</p>
      {saved ? <p className="font-semibold text-primary">Saved answer: {saved.interest}</p> : null}
      {done ? <p className="font-semibold text-primary">Thank you. We will contact you only if we would like to talk.</p> : null}
      <Label htmlFor="interest">Would you like to be part of swypejobs.?</Label>
      <OptionSelect id="interest" value={interest} onValueChange={setInterest} options={["Yes", "Maybe, tell me more", "No, thanks"]} />
      {interest === "No, thanks" ? null : (
        <>
          <p className="mt-3">In what capacity? Pick all that apply.</p>
          {JOIN_CAPACITIES.map((item) => (
            <Label className="mt-2 flex items-start gap-3 font-normal" key={item}>
              <Checkbox checked={capacities.includes(item)} onCheckedChange={() => toggle(item)} className="mt-0.5" />
              {item}
            </Label>
          ))}
          <Label htmlFor="other" className="mt-3">If something else, what?</Label>
          <Input id="other" value={other} onChange={(event) => setOther(event.target.value)} />
          <Label htmlFor="why" className="mt-3">Why do you think you would be a great fit?</Label>
          <Textarea id="why" rows={4} value={why} onChange={(event) => setWhy(event.target.value)} />
          <Label htmlFor="skills" className="mt-3">What skills, experience or projects would you bring?</Label>
          <Textarea id="skills" rows={3} value={skills} onChange={(event) => setSkills(event.target.value)} />
          <Label htmlFor="hours" className="mt-3">How many hours a week could you realistically commit, and from when?</Label>
          <Input id="hours" value={hours} onChange={(event) => setHours(event.target.value)} />
          <Label htmlFor="worthwhile" className="mt-3">What would make it worthwhile for you?</Label>
          <Textarea id="worthwhile" rows={3} value={worthwhile} onChange={(event) => setWorthwhile(event.target.value)} />
          <Label htmlFor="know" className="mt-3">Is there anything we should know before we talk?</Label>
          <Textarea id="know" rows={3} value={know} onChange={(event) => setKnow(event.target.value)} />
        </>
      )}
      <p className="mt-2 text-sm text-destructive">{error}</p>
      <Button className="mt-4" type="button" disabled={busy} onClick={submit}>Submit</Button>
    </>
  );
}
