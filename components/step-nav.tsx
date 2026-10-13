"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePilot } from "./pilot-context";

const STEPS = [
  { href: "/portal/invite", label: "Invite", id: "invite" },
  { href: "/portal/agreements", label: "1. Agreements", id: "agree" },
  { href: "/portal/access", label: "2. Access", id: "access" },
  { href: "/portal/test", label: "3. Test", id: "test" },
  { href: "/portal/feedback", label: "4. Feedback", id: "feedback" },
] as const;

export function StepNav() {
  const pathname = usePathname();
  const { participant } = usePilot();
  const status = participant?.status;

  function unlocked(id: string) {
    if (id === "invite") return true;
    if (!participant) return false;
    if (id === "agree") return true;
    if (id === "access") return status === "signed" || status === "approved" || status === "active";
    return status === "active";
  }

  function done(id: string) {
    if (!participant) return false;
    if (id === "invite") return true;
    if (id === "agree") return status !== "invited";
    if (id === "access") return status === "active";
    return false;
  }

  return (
    <nav aria-label="Pilot steps">
      <ol>
        {STEPS.map((step) => {
          const open = unlocked(step.id);
          const current = pathname === step.href || (step.id === "feedback" && pathname.startsWith("/portal/feedback"));
          return (
            <li key={step.id} className={done(step.id) ? "done" : ""}>
              <Link
                href={open ? step.href : "#"}
                className={`step${open ? "" : " locked"}`}
                aria-current={current ? "step" : undefined}
                aria-disabled={!open}
              >
                <span className="dot">{done(step.id) ? "✓" : open ? "" : "·"}</span>
                {step.label}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
