"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { api, usePilot } from "@/components/pilot-context";
import { questionsFor, type Question } from "@/lib/questions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OptionSelect } from "@/components/ui/option-select";
import { Textarea } from "@/components/ui/textarea";

export default function QuestionnairePage() {
  const { participant, ready, refresh } = usePilot();
  const [mode, setMode] = useState<"mid" | "end">("mid");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [savedNote, setSavedNote] = useState("");

  const questions = useMemo(() => questionsFor(mode), [mode]);
  const sections = useMemo(() => Array.from(new Set(questions.map((item) => item.section))), [questions]);
  const section = sections[step] || sections[0];
  const visible = questions.filter((item) => item.section === section);
  const existing = participant?.questionnaires.find((item) => item.mode === mode);
  const participantRef = useRef(participant);
  participantRef.current = participant;

  useEffect(() => {
    const record = participantRef.current?.questionnaires.find((item) => item.mode === mode);
    setAnswers(record?.answers ?? {});
    setStep(0);
  }, [mode, participant?.id]);

  function setAnswer(id: string, value: string | string[]) {
    setAnswers((current) => ({ ...current, [id]: value }));
  }

  async function save(status: "draft" | "submitted") {
    setBusy(true);
    setError("");
    try {
      await api("/api/feedback", { kind: "questionnaire", mode, status, answers });
      await refresh();
      setSavedNote(status === "submitted" ? "Submitted. Thank you." : "Draft saved. You can come back.");
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (participant?.status !== "active") return <p>Sign in first. <Link href="/portal/access">Access</Link></p>;

  const hideJoinDetails = section.startsWith("I.") && answers.q31 === "No, thanks";

  return (
    <>
      <Button variant="outline" asChild><Link href="/portal/feedback">Back</Link></Button>
      <h1 className="mt-4">Pilot feedback questionnaire</h1>
      <p className="text-sm text-muted-foreground">
        Mid-pilot (Week 2) is sections A to E. End of pilot (Week 4) is sections A to I. About 25 to 30 minutes. No screenshots. There are no right answers.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={mode === "mid" ? "default" : "outline"} type="button" aria-pressed={mode === "mid"} onClick={() => setMode("mid")}>Mid-pilot · A to E</Button>
        <Button size="sm" variant={mode === "end" ? "default" : "outline"} type="button" aria-pressed={mode === "end"} onClick={() => setMode("end")}>End of pilot · A to I</Button>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        {existing?.status === "submitted" ? "This version is already submitted. Sending again replaces it." : "Progress is saved when you use Next or Save draft."}
        {" "}Section {step + 1} of {sections.length}.
      </p>
      <h2>{section}</h2>
      {section.startsWith("I.") ? (
        <p className="text-sm text-muted-foreground">This section is optional in spirit and has no effect on the rest of your feedback. Saying yes is an expression of interest only, not an offer.</p>
      ) : null}
      {visible.map((question) =>
        hideJoinDetails && question.id !== "q31" ? null : <QuestionField key={question.id} question={question} value={answers[question.id]} onChange={(value) => setAnswer(question.id, value)} />,
      )}
      <p className="mt-2 text-sm text-destructive">{error}</p>
      {savedNote ? <p className="font-semibold text-primary">{savedNote}</p> : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" type="button" disabled={step === 0 || busy} onClick={() => setStep((value) => value - 1)}>Previous</Button>
        {step < sections.length - 1 ? (
          <Button type="button" disabled={busy} onClick={async () => { if (await save("draft")) setStep((value) => value + 1); }}>Next</Button>
        ) : (
          <Button type="button" disabled={busy} onClick={() => save("submitted")}>Submit questionnaire</Button>
        )}
        <Button variant="outline" type="button" disabled={busy} onClick={() => save("draft")}>Save draft</Button>
      </div>
    </>
  );
}

function QuestionField({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
}) {
  if (question.kind === "select") {
    return (
      <div className="mt-3 space-y-2">
        <Label htmlFor={question.id}>{question.label}</Label>
        <OptionSelect id={question.id} value={typeof value === "string" ? value : ""} onValueChange={onChange} options={question.options || []} />
      </div>
    );
  }
  if (question.kind === "scale") {
    return (
      <div className="mt-3 space-y-2">
        <Label htmlFor={question.id}>{question.label} (1 poor to 10 excellent)</Label>
        <OptionSelect id={question.id} value={typeof value === "string" ? value : ""} onValueChange={onChange} options={["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]} />
      </div>
    );
  }
  if (question.kind === "checks") {
    const selected = Array.isArray(value) ? value : [];
    return (
      <div className="mt-3">
        <p>{question.label}</p>
        {question.options?.map((option) => (
          <Label className="mt-2 flex items-start gap-3 font-normal" key={option}>
            <Checkbox
              checked={selected.includes(option)}
              onCheckedChange={() => onChange(selected.includes(option) ? selected.filter((item) => item !== option) : selected.concat(option))}
              className="mt-0.5"
            />
            {option}
          </Label>
        ))}
      </div>
    );
  }
  if (question.kind === "text") {
    return (
      <div className="mt-3 space-y-2">
        <Label htmlFor={question.id}>{question.label}</Label>
        <Input id={question.id} value={typeof value === "string" ? value : ""} onChange={(event) => onChange(event.target.value)} />
      </div>
    );
  }
  return (
    <div className="mt-3 space-y-2">
      <Label htmlFor={question.id}>{question.label}</Label>
      <Textarea id={question.id} rows={4} value={typeof value === "string" ? value : ""} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
