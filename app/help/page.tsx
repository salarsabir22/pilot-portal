import { pilot } from "@/lib/config";

export default function HelpPage() {
  return (
    <div className="page">
      <h1>Help</h1>
      <p className="lede">Ask us anything before you sign, or if you get stuck after. We reply {pilot.responseTime}.</p>
      <div className="cards">
        <article className="card">
          <h2 style={{ marginTop: 0 }}>Email</h2>
          <p><a href={`mailto:${pilot.contactEmail}`}>{pilot.contactEmail}</a></p>
          <p className="mute">Use this to withdraw, correct your details, or ask for a clause to be explained in Urdu.</p>
        </article>
        <article className="card">
          <h2 style={{ marginTop: 0 }}>WhatsApp</h2>
          <p>{pilot.whatsapp}</p>
          <p className="mute">Do not send your CNIC, passwords, or screenshots here.</p>
        </article>
        <article className="card">
          <h2 style={{ marginTop: 0 }}>Contact</h2>
          <p>{pilot.contactName}</p>
          <p className="mute">{pilot.founderName} · {pilot.place}</p>
        </article>
      </div>
    </div>
  );
}
