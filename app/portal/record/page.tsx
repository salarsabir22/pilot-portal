"use client";

import Link from "next/link";
import { OPTIONAL_CONSENTS, REQUIRED_CONSENTS } from "@/lib/types";
import { usePilot } from "@/components/pilot-context";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function RecordPage() {
  const { participant, ready } = usePilot();
  if (!ready) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!participant?.audit || !participant.identity) return <p>Nothing is signed yet. <Link href="/portal/agreements">Go to agreements</Link></p>;
  const person = participant.identity;
  const rows: [string, string][] = [
    ["Participant ID", participant.id],
    ["Full name", person.name],
    ["Father’s / husband’s name", person.father],
    ["CNIC", participant.cnicMasked || ""],
    ["Date of birth", person.dob],
    ["Mobile", person.mobile],
    ["Personal email", person.pemail],
    ["University email", person.uemail],
    ["University", person.uni],
    ["Programme", person.prog],
    ["Student ID", person.sid],
    ["Permanent address", person.addr],
    ["Current address", person.res],
    ["Reference", person.ref],
    ["Signed at", participant.audit.signedAt],
    ["Typed name", participant.audit.typedName],
    ["IP", participant.audit.ip],
    ["Device", participant.audit.userAgent],
    ["Document", `${participant.audit.documentVersion} ${participant.audit.documentHash}`],
    ["Countersigned", participant.audit.countersignedAt ? `${participant.audit.countersignedBy} · ${participant.audit.countersignedAt}` : "Waiting"],
  ];
  return (
    <>
      <h1>Signed record</h1>
      <p className="text-sm text-muted-foreground">This is the copy stored with your signature. Print it if you want a paper copy. The CNIC is masked here.</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Field</TableHead>
            <TableHead>Recorded value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(([label, value]) => (
            <TableRow key={label}>
              <TableCell className="w-44 font-medium text-muted-foreground">{label}</TableCell>
              <TableCell>{value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
      <Button className="mt-4" type="button" onClick={() => window.print()}>Print</Button>
    </>
  );
}
