import { pilot } from "@/lib/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <h1>Help</h1>
      <p>Ask us anything before you sign, or if you get stuck after. We reply {pilot.responseTime}.</p>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Email</CardTitle></CardHeader>
          <CardContent>
            <p><a className="text-primary underline" href={`mailto:${pilot.contactEmail}`}>{pilot.contactEmail}</a></p>
            <p className="text-sm text-muted-foreground">Use this to withdraw, correct your details, or ask for a clause to be explained in Urdu.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>WhatsApp</CardTitle></CardHeader>
          <CardContent>
            <p>{pilot.whatsapp}</p>
            <p className="text-sm text-muted-foreground">Do not send your CNIC, passwords, or screenshots here.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Contact</CardTitle></CardHeader>
          <CardContent>
            <p>{pilot.contactName}</p>
            <p className="text-sm text-muted-foreground">{pilot.founderName} · {pilot.place}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
