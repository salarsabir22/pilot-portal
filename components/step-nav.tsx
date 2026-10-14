"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
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
      <ol className="flex gap-3 overflow-x-auto pb-1 md:flex-col md:pb-0">
        {STEPS.map((step) => {
          const open = unlocked(step.id);
          const current = pathname === step.href || (step.id === "feedback" && pathname.startsWith("/portal/feedback"));
          return (
            <li key={step.id}>
              <Link
                href={open ? step.href : "#"}
                aria-current={current ? "step" : undefined}
                aria-disabled={!open}
                className={cn(
                  "flex items-center gap-3 whitespace-nowrap rounded-2xl border border-border bg-card px-4 py-3 text-sm",
                  current && "border-primary font-semibold shadow-[inset_3px_0_0_var(--primary)]",
                  !open && "pointer-events-none opacity-50",
                )}
              >
                <span className={cn("grid h-5 w-5 place-items-center rounded-full border text-[11px]", done(step.id) && "border-primary bg-primary text-primary-foreground")}>
                  {done(step.id) ? "✓" : ""}
                </span>
                {step.label}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
