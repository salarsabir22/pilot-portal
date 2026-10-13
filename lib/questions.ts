export type Question = {
  id: string;
  section: string;
  label: string;
  kind: "textarea" | "select" | "scale" | "checks" | "text";
  options?: string[];
  endOnly?: boolean;
};

export const JOIN_CAPACITIES = [
  "Campus ambassador (spread the word at my university)",
  "Product tester and feedback partner",
  "Marketing, content or social media",
  "Employer outreach and partnerships",
  "Community and operations",
  "Design (product, brand or video)",
  "Engineering or data",
  "Part-time role or internship",
  "Advisor or mentor",
  "Something else",
];

export const SCORECARD = [
  "Overall experience",
  "Ease of use",
  "Design and look",
  "Quality of jobs",
  "Speed and reliability",
  "How likely are you to recommend it to a friend?",
];

export const QUESTIONS: Question[] = [
  { id: "q1", section: "A. First impressions and getting started", kind: "textarea", label: "What did you expect this product to be before you opened it? How close was it?" },
  { id: "q2", section: "A. First impressions and getting started", kind: "textarea", label: "Walk us through your first five minutes. What did you do, and what confused you?" },
  { id: "q3", section: "A. First impressions and getting started", kind: "textarea", label: "How did you feel when you finished setting up your profile?" },
  { id: "q4", section: "A. First impressions and getting started", kind: "textarea", label: "What would you have wanted to know at the start that nobody told you?" },
  { id: "q5", section: "B. The swipe experience", kind: "textarea", label: "What goes through your mind when you see a job card?" },
  { id: "q6", section: "B. The swipe experience", kind: "textarea", label: "Which information on the card helped you decide? What was missing?" },
  { id: "q7", section: "B. The swipe experience", kind: "textarea", label: "Tell us about a job you swiped right on. Why?" },
  { id: "q8", section: "B. The swipe experience", kind: "textarea", label: "Tell us about one you passed on. What made you decide?" },
  { id: "q9", section: "B. The swipe experience", kind: "textarea", label: "Was there a moment you wanted to undo a swipe, or wished you had more detail first?" },
  { id: "q10", section: "C. Matches and conversations", kind: "textarea", label: "Describe what happened when you got a match. How did it feel?" },
  { id: "q11", section: "C. Matches and conversations", kind: "textarea", label: "How did the conversation with the recruiter go? What would have made it better?" },
  { id: "q12", section: "C. Matches and conversations", kind: "textarea", label: "How did waiting for a response compare with applying elsewhere?" },
  { id: "q13", section: "D. Trust, safety and fit", kind: "textarea", label: "Did the jobs feel real and relevant to you? Why or why not?" },
  { id: "q14", section: "D. Trust, safety and fit", kind: "textarea", label: "What would make you trust a listing or a company more?" },
  { id: "q15", section: "D. Trust, safety and fit", kind: "textarea", label: "Was anything uncomfortable for you, such as your data, your profile, or who can see you?" },
  { id: "q16", section: "E. Compared with what you do today", kind: "textarea", label: "Describe how you look for internships and jobs right now, step by step." },
  { id: "q17", section: "E. Compared with what you do today", kind: "textarea", label: "How is this different from what you have used before?" },
  { id: "q18", section: "E. Compared with what you do today", kind: "textarea", label: "What did this make easier? What did it make harder?" },
  { id: "q19", section: "F. Value", kind: "textarea", label: "Has this changed how you think about looking for a job? How?", endOnly: true },
  { id: "q20", section: "F. Value", kind: "textarea", label: "If this disappeared tomorrow, what would you do instead, and how would you feel?", endOnly: true },
  { id: "q21", section: "F. Value", kind: "textarea", label: "What outcome would make you say your time was well spent?", endOnly: true },
  { id: "q22", section: "G. What should change", kind: "textarea", label: "What did you like most?", endOnly: true },
  { id: "q23", section: "G. What should change", kind: "textarea", label: "What did you like least?", endOnly: true },
  { id: "q24", section: "G. What should change", kind: "textarea", label: "What annoyed you, even a little?", endOnly: true },
  { id: "q25", section: "G. What should change", kind: "textarea", label: "If you were the founder, what is the one thing you would change?", endOnly: true },
  { id: "q26", section: "G. What should change", kind: "textarea", label: "What feature, if we added it, would make you use this every day?", endOnly: true },
  { id: "q27", section: "G. What should change", kind: "textarea", label: "Magic wand: what would the perfect job app do for you?", endOnly: true },
  ...SCORECARD.map((label, i) => ({
    id: `score${i + 1}`,
    section: "H. Scorecard",
    kind: "scale" as const,
    label,
    endOnly: true,
  })),
  {
    id: "q28",
    section: "H. Scorecard",
    kind: "select",
    label: "How would you feel if you could no longer use it?",
    options: ["Very disappointed", "Somewhat disappointed", "Not disappointed"],
    endOnly: true,
  },
  { id: "q29", section: "H. Scorecard", kind: "textarea", label: "Who would you recommend it to, and what would you tell them?", endOnly: true },
  { id: "q30", section: "H. Scorecard", kind: "textarea", label: "What would have to be true for you to invite three friends?", endOnly: true },
  {
    id: "q31",
    section: "I. Would you like to be part of swypejobs.?",
    kind: "select",
    label: "Based on your testing experience, would you like to be part of swypejobs.?",
    options: ["Yes", "Maybe, tell me more", "No, thanks"],
    endOnly: true,
  },
  { id: "q32", section: "I. Would you like to be part of swypejobs.?", kind: "checks", label: "In what capacity? Pick all that apply.", options: JOIN_CAPACITIES, endOnly: true },
  { id: "q32other", section: "I. Would you like to be part of swypejobs.?", kind: "text", label: "If something else, what?", endOnly: true },
  { id: "q33", section: "I. Would you like to be part of swypejobs.?", kind: "textarea", label: "Why do you think you would be a great fit? Tell us your story.", endOnly: true },
  { id: "q34", section: "I. Would you like to be part of swypejobs.?", kind: "textarea", label: "What skills, experience or projects would you bring? Include links if you like.", endOnly: true },
  { id: "q35", section: "I. Would you like to be part of swypejobs.?", kind: "text", label: "How many hours a week could you realistically commit, and from when?", endOnly: true },
  { id: "q36", section: "I. Would you like to be part of swypejobs.?", kind: "textarea", label: "What would make it worthwhile for you?", endOnly: true },
  { id: "q37", section: "I. Would you like to be part of swypejobs.?", kind: "textarea", label: "Is there anything we should know before we talk?", endOnly: true },
];

export function questionsFor(mode: "mid" | "end") {
  return mode === "end" ? QUESTIONS : QUESTIONS.filter((q) => !q.endOnly);
}

export const PULSE_STATEMENTS = [
  "It was easy to find my way around",
  "The jobs I saw were relevant to me",
  "I understood what each job card was telling me",
  "I trusted the jobs and companies I saw",
  "I felt in control of who could contact me",
  "I would recommend this to a friend",
];

export const DEVICES = ["Android phone", "iPhone", "Laptop or desktop browser"];
export const HOURS = ["0", "less than 1", "1 to 2", "3 to 4", "5 or more"];
export const DISAPPOINTED = ["Very disappointed", "Somewhat disappointed", "Not disappointed"];
export const BLOCKERS = ["Time", "Technical issue", "It was not useful", "Other"];
