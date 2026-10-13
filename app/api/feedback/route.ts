import { QUESTIONS } from "@/lib/questions";
import { currentParticipantId } from "@/lib/session";
import { updateDb } from "@/lib/store";
import type { BugReport, JoinInterest, PulseAnswer, Questionnaire } from "@/lib/types";

export const runtime = "nodejs";

function text(value: unknown) {
  return String(value ?? "").trim();
}

function validatePulse(body: Partial<PulseAnswer>) {
  const ratings = Array.isArray(body.ratings) ? body.ratings.map(Number) : [];
  if (![1, 2, 3, 4].includes(Number(body.week))) return "Choose week 1, 2, 3, or 4.";
  if (!text(body.device) || !text(body.hours) || text(body.days) === "") return "Tell us the device, hours, and days.";
  if (ratings.length !== 6 || ratings.some((n) => n < 1 || n > 5)) return "Rate every statement from 1 to 5.";
  const required: (keyof PulseAnswer)[] = ["disappointed", "best", "frustrating", "fixFirst", "confused", "expectedMiss", "match", "hitBug", "blocker"];
  for (const key of required) {
    if (!text(body[key])) return "Answer every question. A short honest note is enough.";
  }
  if (body.match === "Yes" && !text(body.conversation)) return "Tell us how the conversation went.";
  if (body.match === "No" && !text(body.noMatchWhy)) return "Tell us what you think got in the way of a match.";
  if (body.hitBug === "Yes" && (!text(body.bugScreen) || !text(body.bugSteps) || !text(body.bugExpected) || !text(body.bugTime))) {
    return "Describe the bug in words: screen, steps, what happened, and when.";
  }
  return null;
}

export async function POST(request: Request) {
  const id = currentParticipantId();
  if (!id) return Response.json({ error: "Sign in first." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return Response.json({ error: "Missing form." }, { status: 400 });

  const result = await updateDb((db) => {
    const participant = db.participants.find((item) => item.id === id);
    if (!participant || participant.status !== "active") return { error: "Feedback opens after your first sign-in.", status: 403 };

    if (body.kind === "pulse") {
      const pulse = body as Partial<PulseAnswer>;
      const error = validatePulse(pulse);
      if (error) return { error, status: 400 };
      const saved: PulseAnswer = {
        week: Number(pulse.week),
        submittedAt: new Date().toISOString(),
        device: text(pulse.device),
        hours: text(pulse.hours),
        days: text(pulse.days),
        ratings: (pulse.ratings as number[]).map(Number),
        disappointed: text(pulse.disappointed),
        best: text(pulse.best),
        frustrating: text(pulse.frustrating),
        fixFirst: text(pulse.fixFirst),
        confused: text(pulse.confused),
        expectedMiss: text(pulse.expectedMiss),
        match: text(pulse.match),
        conversation: text(pulse.conversation),
        noMatchWhy: text(pulse.noMatchWhy),
        hitBug: text(pulse.hitBug),
        bugScreen: text(pulse.bugScreen),
        bugSteps: text(pulse.bugSteps),
        bugExpected: text(pulse.bugExpected),
        bugTime: text(pulse.bugTime),
        blocker: text(pulse.blocker),
        nextAsk: text(pulse.nextAsk),
        anythingElse: text(pulse.anythingElse),
      };
      participant.pulses = participant.pulses.filter((item) => item.week !== saved.week).concat(saved);
      return { ok: true as const };
    }

    if (body.kind === "bug") {
      const screen = text(body.screen);
      const steps = text(body.steps);
      const expected = text(body.expected);
      const actual = text(body.actual);
      const time = text(body.time);
      if (!screen || !steps || !expected || !actual || !time) {
        return { error: "Describe the bug in words. All five fields are required.", status: 400 };
      }
      const report: BugReport = {
        id: `bug-${Date.now()}`,
        submittedAt: new Date().toISOString(),
        screen,
        steps,
        expected,
        actual,
        time,
      };
      participant.bugs.push(report);
      return { ok: true as const };
    }

    if (body.kind === "questionnaire") {
      const mode = body.mode === "end" ? "end" : body.mode === "mid" ? "mid" : null;
      const status = body.status === "submitted" ? "submitted" : "draft";
      if (!mode) return { error: "Choose mid-pilot or end-of-pilot.", status: 400 };
      const answers = (body.answers ?? {}) as Questionnaire["answers"];
      if (status === "submitted") {
        const needed = QUESTIONS.filter((item) => mode === "end" || !item.endOnly);
        for (const question of needed) {
          if (question.id === "q32other") continue;
          if (question.section.startsWith("I.") && answers.q31 === "No, thanks" && question.id !== "q31") continue;
          const value = answers[question.id];
          if (question.kind === "checks") continue;
          if (!text(value)) return { error: `Still needed: ${question.label}`, status: 400 };
        }
      }
      const existing = participant.questionnaires.find((item) => item.mode === mode);
      const record: Questionnaire = {
        mode,
        status,
        answers,
        updatedAt: new Date().toISOString(),
        submittedAt: status === "submitted" ? new Date().toISOString() : existing?.submittedAt,
      };
      participant.questionnaires = participant.questionnaires.filter((item) => item.mode !== mode).concat(record);
      if (mode === "end" && status === "submitted" && answers.q31) {
        participant.join = joinFrom(answers);
      }
      return { ok: true as const };
    }

    if (body.kind === "join") {
      const interest = text(body.interest);
      if (!["Yes", "Maybe, tell me more", "No, thanks"].includes(interest)) {
        return { error: "Choose yes, maybe, or no.", status: 400 };
      }
      const join: JoinInterest = {
        submittedAt: new Date().toISOString(),
        interest,
        capacities: Array.isArray(body.capacities) ? body.capacities.map(text).filter(Boolean) : [],
        other: text(body.other),
        why: text(body.why),
        skills: text(body.skills),
        hours: text(body.hours),
        worthwhile: text(body.worthwhile),
        know: text(body.know),
      };
      if (interest !== "No, thanks" && (!join.why || !join.hours)) {
        return { error: "Tell us why you would be a fit, and how many hours you can give.", status: 400 };
      }
      participant.join = join;
      return { ok: true as const };
    }

    return { error: "Unknown form.", status: 400 };
  });

  if ("error" in result) return Response.json({ error: result.error }, { status: result.status });
  return Response.json({ ok: true });
}

function joinFrom(answers: Record<string, string | string[]>): JoinInterest {
  const value = (key: string) => (Array.isArray(answers[key]) ? "" : text(answers[key]));
  return {
    submittedAt: new Date().toISOString(),
    interest: value("q31"),
    capacities: Array.isArray(answers.q32) ? answers.q32.map(String) : [],
    other: value("q32other"),
    why: value("q33"),
    skills: value("q34"),
    hours: value("q35"),
    worthwhile: value("q36"),
    know: value("q37"),
  };
}
