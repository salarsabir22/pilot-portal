import { pilot } from "@/lib/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6 px-6 py-12 md:py-16">
      <h1>Help</h1>
      <p>Ask us anything before you sign, or if you get stuck after. We reply {pilot.responseTime}.</p>
      <Card>
        <CardHeader><CardTitle>Email</CardTitle></CardHeader>
        <CardContent>
          <p><a className="text-primary underline" href={`mailto:${pilot.contactEmail}`}>{pilot.contactEmail}</a></p>
          <p className="text-sm text-muted-foreground">Use this to withdraw, correct your details, or ask for a clause to be explained in Urdu.</p>
        </CardContent>
      </Card>
    </div>
  );
}
