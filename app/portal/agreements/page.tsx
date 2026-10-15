"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DocView } from "@/components/doc-view";
import { api, usePilot } from "@/components/pilot-context";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { pilot } from "@/lib/config";
import { consentBlocks, ndaBlocks } from "@/lib/documents";
import {
  IDENTITY_FIELDS,
  OPTIONAL_CONSENTS,
  REQUIRED_CONSENTS,
  type Identity,
  type PublicParticipant,
} from "@/lib/types";
import { formatCnic, validateIdentity } from "@/lib/validate";

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
      setOtpNote(form.uemail?.trim()
        ? "A 6-digit code was emailed to both addresses. It expires in 10 minutes."
        : "A 6-digit code was emailed to your personal address. It expires in 10 minutes.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the code.");
    } finally {
      setBusy(false);
    }
  }

  async function sign(acknowledgeMismatch = false) {
    setError("");
    const checked = validateIdentity({ ...form, cnic: form.cnic }, adult);
    if (!checked.ok) {
      setError(checked.error);
      return;
    }
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

  if (!ready) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!participant) {
    return (
      <>
        <h1>Step 1 is locked</h1>
        <p>Open your invite first.</p>
        <Button asChild><Link href="/portal/invite">Enter invite code</Link></Button>
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
        <p className="font-semibold text-primary">The founders countersigned. You can continue to access.</p>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Field</TableHead>
              <TableHead>Recorded value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow><TableCell className="w-40 font-medium text-muted-foreground">Participant</TableCell><TableCell>{participant.identity?.name} ({participant.id})</TableCell></TableRow>
            <TableRow><TableCell className="font-medium text-muted-foreground">CNIC</TableCell><TableCell>{participant.cnicMasked}</TableCell></TableRow>
            <TableRow><TableCell className="font-medium text-muted-foreground">Signed at</TableCell><TableCell>{participant.audit.signedAt}</TableCell></TableRow>
            <TableRow><TableCell className="font-medium text-muted-foreground">IP address</TableCell><TableCell>{participant.audit.ip}</TableCell></TableRow>
            <TableRow><TableCell className="font-medium text-muted-foreground">Document</TableCell><TableCell>{participant.audit.documentVersion}</TableCell></TableRow>
            <TableRow><TableCell className="font-medium text-muted-foreground">Document hash</TableCell><TableCell><code>{participant.audit.documentHash.slice(0, 16)}</code></TableCell></TableRow>
            <TableRow><TableCell className="font-medium text-muted-foreground">OTP</TableCell><TableCell>Confirmed by email</TableCell></TableRow>
            {participant.audit.countersignedAt ? (
              <TableRow><TableCell className="font-medium text-muted-foreground">Countersigned</TableCell><TableCell>{participant.audit.countersignedBy} · {participant.audit.countersignedAt}</TableCell></TableRow>
            ) : null}
          </TableBody>
        </Table>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild><Link href="/portal/record">View the signed record</Link></Button>
          {participant.status === "approved" || participant.status === "active" ? (
            <Button variant="outline" asChild><Link href="/portal/access">Go to Step 2</Link></Button>
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
        <Alert className="mb-4 border-dashed bg-secondary">
          Draft for lawyer review. The dispute choice in clause 10 is not final. Ask us to explain any clause in Urdu.
        </Alert>
      ) : null}
      <h2>1. Read the NDA and consent form</h2>
      <div className="doc" id="doc" tabIndex={0} onScroll={onScroll}>
        <DocView blocks={blocks} />
      </div>
      <p className="text-sm text-muted-foreground">{scrolled ? <span className="font-semibold text-primary">Read to the end.</span> : "Scroll to the end to continue."}</p>

      <fieldset className="space-y-6" disabled={!scrolled}>
        <h2>2. Your details</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {IDENTITY_FIELDS.slice(0, 2).map((field) => (
            <Field key={field.key} id={field.key} label={field.label} value={form[field.key] || ""} onChange={(value) => setForm({ ...form, [field.key]: value })} required={field.key === "name"} />
          ))}
          <Field
            id="cnic"
            label="CNIC number"
            value={form.cnic || ""}
            onChange={(value) => setForm({ ...form, cnic: formatCnic(value) })}
            inputMode="numeric"
            maxLength={15}
            placeholder="35202-1234567-1"
            required
          />
          {IDENTITY_FIELDS.slice(2).map((field) => (
            <Field
              key={field.key}
              id={field.key}
              label={field.label}
              value={form[field.key] || ""}
              onChange={(value) => setForm({ ...form, [field.key]: value })}
              required={field.key === "dob" || field.key === "mobile" || field.key === "pemail"}
            />
          ))}
        </div>
        <Label className="mt-3 flex items-start gap-3 font-normal">
          <Checkbox checked={adult} onCheckedChange={(value) => setAdult(value === true)} className="mt-0.5" />
          I am at least 18, currently enrolled, and my details are true and complete.
        </Label>

        <h2>3. Consent</h2>
        <p className="text-sm text-muted-foreground">Required</p>
        {REQUIRED_CONSENTS.map((label, index) => (
          <Label className="mt-2 flex items-start gap-3 font-normal" key={label}>
            <Checkbox
              checked={required[index]}
              onCheckedChange={(value) => setRequired(required.map((item, i) => (i === index ? value === true : item)))}
              className="mt-0.5"
            />
            {label}
          </Label>
        ))}
        <p className="text-sm text-muted-foreground">Optional. You can say no and still take part.</p>
        {OPTIONAL_CONSENTS.map((label, index) => (
          <Label className="mt-2 flex items-start gap-3 font-normal" key={label}>
            <Checkbox
              checked={optional[index]}
              onCheckedChange={(value) => setOptional(optional.map((item, i) => (i === index ? value === true : item)))}
              className="mt-0.5"
            />
            {label}
          </Label>
        ))}

        <h2>4. Verify and sign</h2>
        <Field id="sig" label="Type your full name to sign" value={sig} onChange={setSig} autoComplete="name" />
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" type="button" disabled={busy} onClick={sendOtp}>
            Send one-time password
          </Button>
          <span className="text-sm text-muted-foreground">{otpNote}</span>
        </div>
        <Field id="otp" label="One-time password" value={otp} onChange={setOtp} className="max-w-[220px]" inputMode="numeric" maxLength={6} />
        <p className="mt-2 text-sm text-destructive">{error}</p>
        {mismatch ? (
          <Button className="mt-3" type="button" disabled={busy} onClick={() => sign(true)}>
            Sign anyway with this name
          </Button>
        ) : (
          <Button className="mt-3" type="button" disabled={busy} onClick={() => sign(false)}>
            Sign and submit
          </Button>
        )}
      </fieldset>
    </>
  );
}

const longFields = new Set(["addr", "res", "ref"]);

function Field({
  id,
  label,
  value,
  onChange,
  className,
  autoComplete,
  inputMode,
  maxLength,
  placeholder,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  autoComplete?: string;
  inputMode?: "numeric" | "text" | "tel" | "email";
  maxLength?: number;
  placeholder?: string;
  required?: boolean;
}) {
  const type = id === "dob" ? "date" : id === "pemail" || id === "uemail" ? "email" : id === "mobile" ? "tel" : "text";
  return (
    <div className={longFields.has(id) ? "space-y-2 md:col-span-2" : "space-y-2"}>
      <Label htmlFor={id}>{label}</Label>
      {longFields.has(id) ? (
        <Textarea id={id} rows={3} value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <Input
          id={id}
          type={type}
          value={value}
          autoComplete={autoComplete || (id === "dob" ? "bday" : undefined)}
          inputMode={inputMode}
          maxLength={maxLength}
          placeholder={placeholder}
          required={required}
          className={className}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </div>
  );
}
