const base = "http://127.0.0.1:3001";
let cookie = "";

async function call(path, body, jar = true) {
  const headers = {};
  if (cookie) headers.cookie = cookie;
  if (body) headers["content-type"] = "application/json";
  const res = await fetch(base + path, {
    method: body ? "POST" : "GET",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const set = res.headers.getSetCookie?.() || [];
  if (jar) {
    for (const item of set) {
      const pair = item.split(";")[0];
      const name = pair.split("=")[0];
      const parts = cookie ? cookie.split("; ").filter((part) => !part.startsWith(name + "=")) : [];
      if (!pair.endsWith("=")) parts.push(pair);
      cookie = parts.join("; ");
    }
  }
  const text = await res.text();
  let data = text;
  try { data = JSON.parse(text); } catch { /* HTML page */ }
  return { status: res.status, data };
}

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

const home = await call("/");
assert(home.status === 200 && String(home.data).includes("Welcome to the swypejobs. pilot"), "home");
const faq = await call("/faq");
assert(faq.status === 200 && String(faq.data).includes("Who can see my CNIC"), "faq");

const invite = await call("/api/invite", { code: "SJ-DEMO" });
assert(invite.status === 200 && invite.data.participant.id === "SJ-P-001", "invite " + JSON.stringify(invite.data));

const otp = await call("/api/otp", { mobile: "03001234567", pemail: "ada@example.com", uemail: "ada@lums.edu.pk" });
assert(otp.status === 200 && /^\d{6}$/.test(otp.data.demoCode), "otp " + JSON.stringify(otp.data));

const sign = await call("/api/sign", {
  identity: {
    name: "Ada Khan",
    father: "Rahim Khan",
    cnic: "35202-1234567-1",
    dob: "01/01/2002",
    mobile: "03001234567",
    pemail: "ada@example.com",
    uemail: "ada@lums.edu.pk",
    uni: "LUMS, Lahore",
    prog: "CS, semester 6",
    sid: "26100123",
    addr: "House 1, Lahore",
    res: "Hostel, LUMS",
    ref: "Sara Khan, sister, 03007654321",
  },
  adult: true,
  consents: { required: [true, true, true, true, true], optional: [false, true, false, false, false] },
  typedName: "Ada Khan",
  otp: otp.data.demoCode,
});
assert(sign.status === 200 && sign.data.participant.status === "signed", "sign " + JSON.stringify(sign.data));
assert(sign.data.participant.cnicMasked === "XXXXX-XXXXXXX-1", "mask");

const early = await call("/api/access", { action: "activate", rules: true, newPassword: "newpassword" });
assert(early.status === 400, "access locked until approval");

const adminCookieBefore = cookie;
const denied = await call("/api/admin");
assert(denied.status === 401, "admin locked");

const login = await call("/api/admin", { action: "login", password: "swype-founder" });
assert(login.status === 200, "admin login");

const approved = await call("/api/admin", { action: "approve", id: "SJ-P-001" });
assert(approved.status === 200 && approved.data.tempPassword, "approve " + JSON.stringify(approved.data));

const me = await call("/api/me");
assert(me.data.participant.status === "approved" && me.data.participant.tempPassword, "temp password visible in demo");

const access = await call("/api/access", { action: "activate", rules: true, newPassword: "newpassword" });
assert(access.status === 200 && access.data.participant.status === "active", "activate " + JSON.stringify(access.data));
assert(access.data.participant.tempPassword === null, "temp password cleared");

const pulse = await call("/api/feedback", {
  kind: "pulse",
  week: 1,
  device: "Android phone",
  hours: "1 to 2",
  days: "3",
  ratings: [4, 4, 3, 3, 5, 4],
  disappointed: "Very disappointed",
  best: "The first card felt clear.",
  frustrating: "I could not tell which jobs were real.",
  fixFirst: "Say when a job is sample data.",
  confused: "The match badge.",
  expectedMiss: "I expected a filter by city.",
  match: "No",
  conversation: "",
  noMatchWhy: "I only swiped on a few cards.",
  hitBug: "No",
  bugScreen: "",
  bugSteps: "",
  bugExpected: "",
  bugTime: "",
  blocker: "Time",
  nextAsk: "",
  anythingElse: "",
});
assert(pulse.status === 200, "pulse " + JSON.stringify(pulse.data));

const bug = await call("/api/feedback", {
  kind: "bug",
  screen: "Discover",
  steps: "Swiped right on the third card",
  expected: "The next card",
  actual: "The deck went blank",
  time: "14 Oct 2026, 9 pm",
});
assert(bug.status === 200, "bug");

const quest = await call("/api/feedback", {
  kind: "questionnaire",
  mode: "mid",
  status: "submitted",
  answers: Object.fromEntries(Array.from({ length: 18 }, (_, i) => [`q${i + 1}`, "A specific note from testing."])),
});
assert(quest.status === 200, "questionnaire " + JSON.stringify(quest.data));

const join = await call("/api/feedback", {
  kind: "join",
  interest: "Maybe, tell me more",
  capacities: ["Campus ambassador (spread the word at my university)"],
  other: "",
  why: "I already run the CS society group.",
  skills: "Events and writing",
  hours: "5 hours from December",
  worthwhile: "A reference and real experience",
  know: "Exams in December",
});
assert(join.status === 200, "join");

const after = await call("/api/me");
assert(after.data.participant.pulses.length === 1, "pulse stored");
assert(after.data.participant.bugs.length === 1, "bug stored");
assert(after.data.participant.join.interest.startsWith("Maybe"), "join stored");
assert(after.data.participant.cnicMasked === "XXXXX-XXXXXXX-1", "still masked");

const queue = await call("/api/admin");
const row = queue.data.participants.find((item) => item.id === "SJ-P-001");
assert(row.cnic === "35202-1234567-1", "founder can see CNIC");
assert(row.status === "active", "founder sees active");

console.log("flow ok", { cookieNames: cookie.split("; ").map((part) => part.split("=")[0]) });
