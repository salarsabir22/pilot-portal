"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { api, usePilot } from "@/components/pilot-context";
import { questionsFor, type Question } from "@/lib/questions";

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

  if (!ready) return <p className="mute">Loading…</p>;
  if (participant?.status !== "active") return <p>Sign in first. <Link href="/portal/access">Access</Link></p>;

  const hideJoinDetails = section.startsWith("I.") && answers.q31 === "No, thanks";

  return (
    <>
      <Link className="btn alt" href="/portal/feedback" style={{ marginTop: 0 }}>Back</Link>
      <h1>Pilot feedback questionnaire</h1>
      <p className="mute">
        Mid-pilot (Week 2) is sections A to E. End of pilot (Week 4) is sections A to I. About 25 to 30 minutes. No screenshots. There are no right answers.
      </p>
      <div className="tabs">
        <button className="chip" type="button" aria-pressed={mode === "mid"} onClick={() => setMode("mid")}>Mid-pilot · A to E</button>
        <button className="chip" type="button" aria-pressed={mode === "end"} onClick={() => setMode("end")}>End of pilot · A to I</button>
      </div>
      <p className="mute">
        {existing?.status === "submitted" ? "This version is already submitted. Sending again replaces it." : "Progress is saved when you use Next or Save draft."}
        {" "}Section {step + 1} of {sections.length}.
      </p>
      <h2>{section}</h2>
      {section.startsWith("I.") ? (
        <p className="mute">This section is optional in spirit and has no effect on the rest of your feedback. Saying yes is an expression of interest only, not an offer.</p>
      ) : null}
      {visible.map((question) =>
        hideJoinDetails && question.id !== "q31" ? null : <QuestionField key={question.id} question={question} value={answers[question.id]} onChange={(value) => setAnswer(question.id, value)} />,
      )}
      <div className="err">{error}</div>
      {savedNote ? <p className="ok">{savedNote}</p> : null}
      <div className="row-actions">
        <button className="btn alt" type="button" disabled={step === 0 || busy} onClick={() => setStep((value) => value - 1)}>Previous</button>
        {step < sections.length - 1 ? (
          <button className="btn" type="button" disabled={busy} onClick={async () => { if (await save("draft")) setStep((value) => value + 1); }}>Next</button>
        ) : (
          <button className="btn" type="button" disabled={busy} onClick={() => save("submitted")}>Submit questionnaire</button>
        )}
        <button className="btn alt" type="button" disabled={busy} onClick={() => save("draft")}>Save draft</button>
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
      <>
        <label htmlFor={question.id}>{question.label}</label>
        <select id={question.id} value={typeof value === "string" ? value : ""} onChange={(event) => onChange(event.target.value)}>
          <option value="">Choose</option>
          {question.options?.map((option) => <option key={option}>{option}</option>)}
        </select>
      </>
    );
  }
  if (question.kind === "scale") {
    return (
      <>
        <label htmlFor={question.id}>{question.label} (1 poor to 10 excellent)</label>
        <select id={question.id} value={typeof value === "string" ? value : ""} onChange={(event) => onChange(event.target.value)}>
          <option value="">Choose</option>
          {Array.from({ length: 10 }, (_, index) => <option key={index + 1}>{index + 1}</option>)}
        </select>
      </>
    );
  }
  if (question.kind === "checks") {
    const selected = Array.isArray(value) ? value : [];
    return (
      <>
        <p>{question.label}</p>
        {question.options?.map((option) => (
          <label className="cb" key={option}>
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => onChange(selected.includes(option) ? selected.filter((item) => item !== option) : selected.concat(option))}
            />
            {option}
          </label>
        ))}
      </>
    );
  }
  if (question.kind === "text") {
    return (
      <>
        <label htmlFor={question.id}>{question.label}</label>
        <input id={question.id} value={typeof value === "string" ? value : ""} onChange={(event) => onChange(event.target.value)} />
      </>
    );
  }
  return (
    <>
      <label htmlFor={question.id}>{question.label}</label>
      <textarea id={question.id} rows={4} value={typeof value === "string" ? value : ""} onChange={(event) => onChange(event.target.value)} />
    </>
  );
}
