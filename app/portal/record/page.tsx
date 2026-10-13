"use client";

import Link from "next/link";
import { OPTIONAL_CONSENTS, REQUIRED_CONSENTS } from "@/lib/types";
import { usePilot } from "@/components/pilot-context";

export default function RecordPage() {
  const { participant, ready } = usePilot();
  if (!ready) return <p className="mute">Loading…</p>;
  if (!participant?.audit || !participant.identity) return <p>Nothing is signed yet. <Link href="/portal/agreements">Go to agreements</Link></p>;
  const person = participant.identity;
  return (
    <>
      <h1>Signed record</h1>
      <p className="mute">This is the copy stored with your signature. Print it if you want a paper copy. The CNIC is masked here.</p>
      <table>
        <tbody>
          <tr><th>Participant ID</th><td>{participant.id}</td></tr>
          <tr><th>Full name</th><td>{person.name}</td></tr>
          <tr><th>Father’s / husband’s name</th><td>{person.father}</td></tr>
          <tr><th>CNIC</th><td>{participant.cnicMasked}</td></tr>
          <tr><th>Date of birth</th><td>{person.dob}</td></tr>
          <tr><th>Mobile</th><td>{person.mobile}</td></tr>
          <tr><th>Personal email</th><td>{person.pemail}</td></tr>
          <tr><th>University email</th><td>{person.uemail}</td></tr>
          <tr><th>University</th><td>{person.uni}</td></tr>
          <tr><th>Programme</th><td>{person.prog}</td></tr>
          <tr><th>Student ID</th><td>{person.sid}</td></tr>
          <tr><th>Permanent address</th><td>{person.addr}</td></tr>
          <tr><th>Current address</th><td>{person.res}</td></tr>
          <tr><th>Reference</th><td>{person.ref}</td></tr>
          <tr><th>Signed at</th><td>{participant.audit.signedAt}</td></tr>
          <tr><th>Typed name</th><td>{participant.audit.typedName}</td></tr>
          <tr><th>IP</th><td>{participant.audit.ip}</td></tr>
          <tr><th>Device</th><td>{participant.audit.userAgent}</td></tr>
          <tr><th>Document</th><td>{participant.audit.documentVersion}<br /><code>{participant.audit.documentHash}</code></td></tr>
          <tr><th>Countersigned</th><td>{participant.audit.countersignedAt ? `${participant.audit.countersignedBy} · ${participant.audit.countersignedAt}` : "Waiting"}</td></tr>
        </tbody>
      </table>
      <h2>Required consents</h2>
      <ul>
        {REQUIRED_CONSENTS.map((item, index) => (
          <li key={item}>{participant.consents?.required[index] ? "Yes" : "No"} — {item}</li>
        ))}
      </ul>
      <h2>Optional consents</h2>
      <ul>
        {OPTIONAL_CONSENTS.map((item, index) => (
          <li key={item}>{participant.consents?.optional[index] ? "Yes" : "No"} — {item}</li>
        ))}
      </ul>
      <button className="btn" type="button" onClick={() => window.print()}>Print</button>
    </>
  );
}
