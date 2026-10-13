"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { api, usePilot } from "./pilot-context";

export function Header() {
  const { participant, setParticipant } = usePilot();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const next = localStorage.getItem("sj-theme") === "dark";
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("sj-theme", next ? "dark" : "light");
  }

  async function signOut() {
    await api("/api/logout", {});
    setParticipant(null);
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-5 py-3">
      <Link href="/" className="text-[22px] font-extrabold tracking-tight">
        swypejobs<span className="text-primary">.</span> <span className="text-sm font-normal text-muted-foreground">pilot</span>
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" asChild><Link href="/faq">FAQ</Link></Button>
        <Button variant="outline" size="sm" asChild><Link href="/help">Help</Link></Button>
        <Button variant="outline" size="sm" asChild><Link href="/admin">Founder</Link></Button>
        <Button variant="secondary" size="sm" type="button" aria-pressed={dark} onClick={toggleTheme}>
          {dark ? "Light" : "Dark"}
        </Button>
        {participant ? (
          <Button variant="ghost" size="sm" type="button" onClick={signOut}>
            {participant.id} · Sign out
          </Button>
        ) : null}
      </div>
    </header>
  );
}
