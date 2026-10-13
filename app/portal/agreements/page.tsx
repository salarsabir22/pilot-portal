"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DocView } from "@/components/doc-view";
import { api, usePilot } from "@/components/pilot-context";
import { pilot } from "@/lib/config";
import { consentBlocks, ndaBlocks } from "@/lib/documents";
import {
  IDENTITY_FIELDS,
  OPTIONAL_CONSENTS,
  REQUIRED_CONSENTS,
  type Identity,
  type PublicParticipant,
} from "@/lib/types";

const draftKey = "sj-agreement-draft";

type Draft = {
  form: Record<string, string>;
  adult: boolean;
  required: boolean[];
  optional: boolean[];
  sig: string;
};

export default function AgreementsPage() {
  const { participant, ready, setParticipant } = usePilot();
  const [scrolled, setScrolled] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({ cnic: "" });
  const [adult, setAdult] = useState(false);
  const [required, setRequired] = useState(() => REQUIRED_CONSENTS.map(() => false));
  const [optional, setOptional] = useState(() => OPTIONAL_CONSENTS.map(() => false));
  const [sig, setSig] = useState("");
  const [otp, setOtp] = useState("");
  const [otpNote, setOtpNote] = useState("");
  const [error, setError] = useState("");
  const [mismatch, setMismatch] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem(draftKey);
    if (!saved) return;
    const draft = JSON.parse(saved) as Draft;
    setForm(draft.form);
    setAdult(draft.adult);
    setRequired(draft.required);
    setOptional(draft.optional);
    setSig(draft.sig);
  }, []);

  useEffect(() => {
    const draft: Draft = { form, adult, required, optional, sig };
    sessionStorage.setItem(draftKey, JSON.stringify(draft));
  }, [form, adult, required, optional, sig]);

  const blocks = useMemo(
    () => [...ndaBlocks(participant?.id || "SJ-P-000"), ...consentBlocks(participant?.id || "SJ-P-000")],
    [participant?.id],
  );

  function onScroll(event: React.UIEvent<HTMLDivElement>) {
    const el = event.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) setScrolled(true);
  }

  useEffect(() => {
    const el = document.getElementById("doc");
    if (el && el.scrollHeight <= el.clientHeight + 8) setScrolled(true);
  }, [blocks]);

  async function sendOtp() {
    setError("");
    setBusy(true);
    try {
      await api("/api/otp", {
        pemail: form.pemail,
        uemail: form.uemail,
      });
      setOtpNote("A 6-digit code was emailed to both addresses. It expires in 10 minutes.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the code.");
    } finally {
      setBusy(false);
    }
  }

  async function sign(acknowledgeMismatch = false) {
    setError("");
    setBusy(true);
    try {
      const identity = Object.fromEntries(IDENTITY_FIELDS.map((field) => [field.key, form[field.key] || ""])) as Identity;
      const data = await api<{ participant: PublicParticipant }>("/api/sign", {
        identity: { ...identity, cnic: form.cnic },
        adult,
        consents: { required, optional },
        typedName: sig,
        otp,
        acknowledgeMismatch,
      });
      sessionStorage.removeItem(draftKey);
      setParticipant(data.participant);
      setMismatch(false);
    } catch (err) {
      const coded = err as Error & { code?: string };
      if (coded.code === "NAME_MISMATCH") setMismatch(true);
      setError(coded.message);
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return <p className="mute">Loading…</p>;
  if (!participant) {
    return (
      <>
        <h1>Step 1 is locked</h1>
        <p>Open your invite first.</p>
        <Link className="btn" href="/portal/invite">Enter invite code</Link>
      </>
    );
  }

  if (participant.audit) {
    return (
      <>
        <h1>{participant.status === "invited" ? "Signed" : participant.status === "signed" ? "Signed. Waiting for approval" : "Approved"}</h1>
        {participant.status === "signed" ? (
          <p>Thank you. A founder reviews this within {pilot.approvalHours} hours, countersigns, and then Step 2 unlocks. Your record is saved with the time, device, and document version.</p>
        ) : (
          <p className="ok">The founders countersigned. You can continue to access.</p>
        )}
        <div className="scroll">
          <table>
            <tbody>
              <tr><th>Participant</th><td>{participant.identity?.name} ({participant.id})</td></tr>
              <tr><th>CNIC</th><td>{participant.cnicMasked}</td></tr>
              <tr><th>Signed at</th><td>{participant.audit.signedAt}</td></tr>
              <tr><th>IP address</th><td>{participant.audit.ip}</td></tr>
              <tr><th>Document</th><td>{participant.audit.documentVersion}</td></tr>
              <tr><th>Document hash</th><td><code>{participant.audit.documentHash.slice(0, 16)}</code></td></tr>
              <tr><th>OTP</th><td>Confirmed by email</td></tr>
              {participant.audit.countersignedAt ? (
                <tr><th>Countersigned</th><td>{participant.audit.countersignedBy} · {participant.audit.countersignedAt}</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className="row-actions">
          <Link className="btn" href="/portal/record">View the signed record</Link>
          {participant.status === "approved" || participant.status === "active" ? (
            <Link className="btn alt" href="/portal/access">Go to Step 2</Link>
          ) : null}
        </div>
      </>
    );
  }

  return (
    <>
      <h1>Step 1 of 4: Agreements</h1>
      <p>
        Before we show you anything, we need two things from you. First, a confidentiality agreement, because we are testing something that is not public yet. Second, your consent, so you know exactly what we collect and why. It takes about 10 minutes. Please read carefully and ask us anything.
      </p>
      {!pilot.documentsFinal ? (
        <div className="banner">
          Draft for lawyer review. Bracketed names, dates, and the choices in clauses 9 and 10 are not final. Ask us to explain any clause in Urdu.
        </div>
      ) : null}
      <h2>1. Read the NDA and consent form</h2>
      <div className="doc" id="doc" tabIndex={0} onScroll={onScroll}>
        <DocView blocks={blocks} />
      </div>
      <p className="mute">{scrolled ? <span className="ok">Read to the end.</span> : "Scroll to the end to continue."}</p>

      <fieldset disabled={!scrolled}>
        <h2>2. Your details</h2>
        <div className="grid">
          {IDENTITY_FIELDS.slice(0, 2).map((field) => (
            <Field key={field.key} id={field.key} label={field.label} value={form[field.key] || ""} onChange={(value) => setForm({ ...form, [field.key]: value })} />
          ))}
          <Field id="cnic" label="CNIC number (XXXXX-XXXXXXX-X)" value={form.cnic || ""} onChange={(value) => setForm({ ...form, cnic: value })} />
          {IDENTITY_FIELDS.slice(2).map((field) => (
            <Field key={field.key} id={field.key} label={field.label} value={form[field.key] || ""} onChange={(value) => setForm({ ...form, [field.key]: value })} />
          ))}
        </div>
        <label className="cb">
          <input type="checkbox" checked={adult} onChange={(event) => setAdult(event.target.checked)} />
          I am at least 18, currently enrolled, and my details are true and complete.
        </label>

        <h2>3. Consent</h2>
        <p className="mute">Required</p>
        {REQUIRED_CONSENTS.map((label, index) => (
          <label className="cb" key={label}>
            <input
              type="checkbox"
              checked={required[index]}
              onChange={(event) => setRequired(required.map((item, i) => (i === index ? event.target.checked : item)))}
            />
            {label}
          </label>
        ))}
        <p className="mute">Optional. You can say no and still take part.</p>
        {OPTIONAL_CONSENTS.map((label, index) => (
          <label className="cb" key={label}>
            <input
              type="checkbox"
              checked={optional[index]}
              onChange={(event) => setOptional(optional.map((item, i) => (i === index ? event.target.checked : item)))}
            />
            {label}
          </label>
        ))}

        <h2>4. Verify and sign</h2>
        <label htmlFor="sig">Type your full name to sign</label>
        <input id="sig" value={sig} onChange={(event) => setSig(event.target.value)} autoComplete="name" />
        <div className="row-actions">
          <button className="btn alt" type="button" style={{ marginLeft: 0 }} disabled={busy} onClick={sendOtp}>
            Send one-time password
          </button>
          <span className="mute">{otpNote}</span>
        </div>
        <label htmlFor="otp">One-time password</label>
        <input id="otp" inputMode="numeric" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value)} style={{ maxWidth: 200 }} />
        <div className="err">{error}</div>
        {mismatch ? (
          <button className="btn" type="button" disabled={busy} onClick={() => sign(true)}>
            Sign anyway with this name
          </button>
        ) : (
          <button className="btn" type="button" disabled={busy} onClick={() => sign(false)}>
            Sign and submit
          </button>
        )}
      </fieldset>
    </>
  );
}

function Field({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
