import { pilot } from "./config";

export type DocBlock =
  | { type: "p"; text: string }
  | { type: "h"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] };

const p = (text: string): DocBlock => ({ type: "p", text });
const h = (text: string): DocBlock => ({ type: "h", text });
const ul = (items: string[]): DocBlock => ({ type: "ul", items });
const table = (headers: string[], rows: string[][]): DocBlock => ({ type: "table", headers, rows });

function breachClause(): DocBlock[] {
  const blocks: DocBlock[] = [
    h("9. Breach and remedies"),
    p(
      "9.1 You acknowledge that a breach could cause serious harm that money alone cannot repair, so we may ask a court for an injunction or specific performance, in addition to any other remedy.",
    ),
    p(
      "9.2 You will compensate us for losses, damages and costs, including reasonable legal fees, that result from your breach.",
    ),
  ];
  if (pilot.breachOption !== "B") {
    blocks.push(p("9.3 Option A: no fixed sum. Compensation will be the actual loss proved."));
  }
  if (pilot.breachOption !== "A") {
    blocks.push(
      p(
        `9.3 Option B: fixed sum, to be confirmed by your lawyer. Because loss from a leak is hard to measure, the parties agree that PKR ${pilot.fixedSumPkr} is reasonable compensation for each proven breach, being a genuine pre-estimate of loss and not a penalty.`,
      ),
    );
  }
  blocks.push(
    p(
      "9.4 You agree that we may share the details in Part A with our legal advisers, courts, arbitrators, and law-enforcement or regulatory authorities where needed to investigate or enforce this Agreement.",
    ),
  );
  return blocks;
}

function disputeClause(): DocBlock[] {
  const blocks: DocBlock[] = [
    h("10. Governing law and disputes"),
    p(
      "This Agreement is governed by the laws of Pakistan. If a dispute arises, the parties will first try to resolve it by good-faith discussion within 14 days of a written notice.",
    ),
  ];
  if (pilot.disputeOption !== "B") {
    blocks.push(p("Option A: If that fails, the courts at Karachi have exclusive jurisdiction."));
  }
  if (pilot.disputeOption !== "A") {
    blocks.push(
      p(
        "Option B: If that fails, the dispute goes to a sole arbitrator seated in Karachi under the Arbitration Act, 1940.",
      ),
    );
  }
  blocks.push(
    p("Either way, we may seek urgent injunctive relief from a competent court at any time."),
  );
  return blocks;
}

export function ndaBlocks(participantId: string): DocBlock[] {
  return [
    p(
      `Agreement ref: ${pilot.agreementRefPrefix}-${participantId.replace("SJ-P-", "")} · Participant ID: ${participantId} · Place: ${pilot.place}`,
    ),
    p("This Non-Disclosure Agreement (the “Agreement”) is made between:"),
    p(
      `1. ${pilot.companyLegalName}, of ${pilot.officeAddress}, which operates the product known as swypejobs. (“swypejobs.”, “we”, “us”); and`,
    ),
    p("2. The person whose details are given in Part A below (the “Participant”, “you”)."),
    h("Part A. Participant details"),
    p(
      "The details you enter in the form under this document are Part A. All of those fields are mandatory. You declare that they are true and complete, that you are at least 18 years old, and that giving false details is itself a breach of this Agreement.",
    ),
    h("Part B. Terms"),
    h("1. Purpose"),
    p(
      `swypejobs. is developing a job-matching product for students and early-career talent that is not yet public. We are inviting you to test it and give feedback in a closed pilot from ${pilot.pilotStart} to ${pilot.pilotEnd} (the “Pilot”). To let you do this we will share non-public information with you. In return, you agree to the terms below.`,
    ),
    h("2. Confidential Information"),
    p(
      "2.1 “Confidential Information” means everything non-public that you see, hear, receive or learn through the Pilot, in any form, including: the product, its design, screens, features, flows, wording and behaviour; the code, data, job listings, employer and recruiter information; login credentials; our plans, roadmap, pricing, partners, research and results; the contents of surveys, interviews and feedback sessions; and the fact that the Pilot exists and who takes part in it.",
    ),
    p(
      "2.2 It does not include information that (a) is or becomes public without your breach, (b) you already lawfully knew before the Pilot, as shown by written records, (c) you receive lawfully from a third party who is free to share it, or (d) you must disclose by law or court order, provided you tell us first (where lawful) and disclose only what is required.",
    ),
    h("3. Your obligations"),
    p("You will:"),
    ul([
      "keep all Confidential Information strictly confidential;",
      "use it only to test the product and give us feedback;",
      "not disclose it to anyone, including family, friends, classmates, employers, competitors, journalists, social media, group chats or AI tools;",
      "protect it with at least the care you use for your own confidential information, and never less than reasonable care;",
      "not reverse engineer, decompile, scrape, copy or try to reach any part of the product you have not been given access to;",
      "not use it to build, advise on or help any competing product or service; and",
      "tell us immediately if you learn of any loss or leak.",
    ]),
    h("4. No screenshots, recordings or copies"),
    p(
      "Unless we give you written permission, you must not: take screenshots or screen recordings; photograph or film a screen; screen-share or live-stream the product; make detailed notes, sketches or copies of designs or screens for others; forward, post or upload any Pilot material; or paste Pilot content into any third-party tool, including AI chatbots. If you find a bug, describe it in words in the feedback form. You do not need images.",
    ),
    h("5. Credentials, monitoring and identification"),
    p(
      "5.1 Your login credentials are personal and non-transferable. You will not share them, you are responsible for all activity under your account, and you will tell us at once if they are lost or misused.",
    ),
    p(
      "5.2 You agree that we may record your account activity (sign-ins, device and browser type, IP address, screens visited and timestamps), may display your name or Participant ID as a visible watermark inside the product, and may use technical measures to detect or block screen capture.",
    ),
    p("5.3 We may suspend or end your access immediately if we reasonably suspect a breach."),
    h("6. Feedback and ownership"),
    p(
      "6.1 All rights in the product and in all Confidential Information stay with swypejobs. You receive only a limited, revocable, non-transferable permission to use the product during the Pilot.",
    ),
    p(
      "6.2 You give swypejobs. a free, perpetual, worldwide right to use any feedback, suggestions and ideas you give us, without credit or payment to you.",
    ),
    p(
      "6.3 This Agreement does not create employment, partnership, agency or any right to salary, equity or other compensation. Any future role or arrangement would need a separate written agreement.",
    ),
    h("7. Duration"),
    p(
      `This Agreement starts on the date you sign. Your confidentiality obligations continue throughout the Pilot and for ${pilot.confidentialityYears} years after the Pilot ends (or after the last disclosure to you, whichever is later). For trade secrets, source code, credentials and unreleased business information, they continue for as long as that information stays confidential.`,
    ),
    h("8. Return and deletion"),
    p(
      "On request, or when the Pilot ends, you will stop using the product, delete all Confidential Information in your possession (including notes and downloads), and confirm in writing if we ask.",
    ),
    ...breachClause(),
    ...disputeClause(),
    h("11. General"),
    p(
      "This Agreement and the Pilot Consent Form are the whole agreement between us on the Pilot; if they conflict on confidentiality, this Agreement prevails. Changes must be in writing and signed. If any clause is unenforceable the rest still applies. A delay in enforcing a right is not a waiver. We may transfer this Agreement to a successor; you may not. Notices may be sent by email to the addresses in Part A. This Agreement may be signed electronically (including a typed name with one-time-password verification) and in counterparts, and the parties intend electronic signature to be binding to the fullest extent permitted by Pakistani law, including the Electronic Transactions Ordinance, 2002. This Agreement is in English and we will explain any clause in Urdu on request.",
    ),
    h("12. Your acknowledgements"),
    p(
      "I have read and understood this entire Agreement. I had the chance to ask questions and to take independent advice. I am signing voluntarily and I agree to be legally bound by it.",
    ),
  ];
}

export function consentBlocks(participantId: string): DocBlock[] {
  return [
    p(
      `Form ref: ${pilot.consentRefPrefix}-${participantId.replace("SJ-P-", "")} · Participant ID: ${participantId}`,
    ),
    h("1. Who we are"),
    p(
      `swypejobs. (operated by ${pilot.companyLegalName}, ${pilot.officeAddress}) is building a job-matching product for students and early-career talent. We are running a closed pilot with a small group of students from ${pilot.pilotStart} to ${pilot.pilotEnd} (the “Pilot”). This form explains what the Pilot involves, what personal data we collect and why, and asks for your consent. Please read it fully. You can ask us anything before you sign.`,
    ),
    h("2. Your details"),
    p(
      "I confirm I am at least 18 years old, I am currently enrolled at the university named in my details, and I own a device that can run the Pilot.",
    ),
    h("3. What the Pilot involves"),
    p(
      `You will use a pre-release version of the product and tell us honestly what works and what does not. We expect up to ${pilot.weeklyHours} hours per week for ${pilot.testingWeeks} weeks. You can spread this across the week.`,
    ),
    p(
      `At the end of the Pilot there is a longer feedback questionnaire and a ${pilot.interviewMinutes}-minute interview.`,
    ),
    p(`What you get: ${pilot.rewards}. These are not payment for work, and we may change them with notice.`),
    table(
      ["Activity", "Approx. time per week"],
      [
        ["Testing sessions in the product", "3 hours"],
        ["Guided missions (specific tasks we give you)", "1 hour"],
        ["Weekly pulse survey and written notes", "30 minutes"],
        ["Check-in call or interview (weekly or fortnightly)", "30 minutes"],
      ],
    ),
    h("3A. Please understand"),
    ul([
      `Voluntary. Taking part is your choice. You may withdraw at any time by emailing ${pilot.contactEmail}. If you withdraw, your confidentiality duties under the NDA continue.`,
      "Not employment. The Pilot is not a job, internship or work placement, and it does not guarantee any job interview, offer or future role.",
      "Pre-release software. The product may have bugs, may change, may be unavailable, and data inside it may be reset. Do not rely on it for real applications.",
      "Test data. Job listings and employer accounts inside the Pilot may be test or sample data unless we tell you otherwise.",
    ]),
    h("4. What personal data we collect, and why"),
    p("We do not sell your data and we do not share your identity or profile with employers unless you opt in below."),
    table(
      ["What", "Examples", "Why we need it", "Who can see it"],
      [
        [
          "Identity details",
          "Name, CNIC number, date of birth, contact details, student ID",
          "To confirm who you are, contact you, and enforce our agreements with you",
          "Named founders and our legal advisers only",
        ],
        [
          "Account and profile data",
          "Profile you build, preferences, swipes, matches, chat messages",
          "To run the Pilot and see how the product behaves",
          "Founders and product team",
        ],
        [
          "Usage and device data",
          "Sign-ins, device and browser type, IP address, screens visited, timestamps",
          "To fix bugs, measure use, and protect confidential material",
          "Founders and product team",
        ],
        [
          "Feedback",
          "Survey answers, notes, interview answers",
          "To improve the product",
          "Founders and product team",
        ],
      ],
    ),
    h("5. How we protect your data and the product"),
    ul([
      "To protect confidential material, we may show your name or Participant ID as a watermark inside the product, record access logs, and use technical measures to detect or block screen capture.",
      "Your CNIC number is stored encrypted, shown only in masked form (for example XXXXX-XXXXXXX-1) inside our tools, and accessible only to named founders and our legal advisers. We never ask you to send a CNIC photo unless we tell you why first.",
      `We keep identity details for ${pilot.identityRetentionYears} years after the Pilot ends, to cover the period in which a legal claim could arise, and then delete them unless a dispute is open. We keep other Pilot data for up to ${pilot.otherDataMonths} months, then delete or anonymise it.`,
      "We may disclose your details to lawyers, courts, arbitrators, or law-enforcement or regulatory authorities where the law requires it or where needed to enforce our agreements.",
      "If we suffer a data security incident that affects you, we will tell you promptly.",
    ]),
    h("6. Your rights"),
    p(
      `You may ask to see the personal data we hold about you, to correct it, or to ask us to delete it (we may need to keep identity details for the period above). You may withdraw any optional consent at any time. Contact: ${pilot.contactName}, ${pilot.contactEmail}, ${pilot.whatsapp}. If we cannot resolve a concern, you may complain to the relevant authority under Pakistani law.`,
    ),
    h("7. Your consent"),
    p(
      "Required consents are the boxes we cannot run the Pilot without. Optional consents can be refused and you can still take part. Both sets are in the form under this document.",
    ),
    h("8. Signature"),
    p(
      "You sign by typing your full name and confirming a one-time password sent to your email. swypejobs. countersigns after a founder checks your details.",
    ),
  ];
}

function blockText(block: DocBlock) {
  if (block.type === "p" || block.type === "h") return block.text;
  if (block.type === "ul") return block.items.join("\n");
  return [block.headers.join(" | "), ...block.rows.map((row) => row.join(" | "))].join("\n");
}

export function documentPlain(participantId: string) {
  return [...ndaBlocks(participantId), ...consentBlocks(participantId)].map(blockText).join("\n");
}
