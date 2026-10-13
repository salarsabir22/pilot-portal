import { pilot } from "@/lib/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const items = [
  ["Is this a job?", "No. The pilot is not employment, an internship, or a work placement, and it does not promise an interview or a role."],
  ["Why do I have to sign before I see the product?", "The product is not public. The NDA covers what you see, and the consent form says exactly what we collect. Step 2 stays locked until a founder checks your details and countersigns."],
  ["What data do you collect?", "Identity details (founders and our lawyer only), the profile and usage inside the pilot, and your feedback. We do not sell it. We do not show your profile to employers unless you opt in."],
  ["Who can see my CNIC?", "It is stored encrypted and shown masked. Named founders and our legal advisers can open the full number, and we keep a log of that access. We do not ask for a photo of the card."],
  ["How long do you keep it?", `Identity details for ${pilot.identityRetentionYears} years after the pilot, then deleted unless a dispute is open. Other pilot data for up to ${pilot.otherDataMonths} months. Interview recordings, if you allow them, are deleted within ${pilot.recordingRetentionDays} days.`],
  ["Can I say no to some things?", "Yes. The optional boxes (recordings, quotes, showing your profile to employers, future contact, and a public name) can all be refused. You can still take part."],
  ["Can I withdraw?", `Yes. Email ${pilot.contactEmail}. Your confidentiality duties under the NDA continue after you leave.`],
  ["Why can’t I send screenshots?", "A screenshot is a copy of something that is not public. Describe bugs in words. We can find them from the time and the screen name, and your activity is logged."],
  ["Will my name appear in the product?", "Yes. After you sign in, your name and participant ID are watermarked on the portal, and the same approach is used inside the product. That is in the consent form."],
  ["What happens at the end?", "You finish the full questionnaire and a short interview. We revoke logins, keep data only for the periods above, and tell you what we learned."],
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-3 px-5 py-8">
      <h1>FAQ</h1>
      <p className="text-sm text-muted-foreground">Questions about the agreement, your data, the time, and what happens next.</p>
      {items.map(([title, body]) => (
        <Card key={title}>
          <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
          <CardContent>{body}</CardContent>
        </Card>
      ))}
    </div>
  );
}
