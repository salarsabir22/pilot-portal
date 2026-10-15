"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { api, usePilot } from "./pilot-context";

export function Header() {
  const { participant } = usePilot();
  const [dark, setDark] = useState(false);
  const [leaving, setLeaving] = useState(false);

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
    if (leaving) return;
    setLeaving(true);
    try {
      await api("/api/logout", {});
      window.location.replace("/");
    } catch {
      setLeaving(false);
    }
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-6 px-6">
        <Link href="/" className="text-xl font-extrabold tracking-tight">
          swypejobs<span className="text-primary">.</span>
          <span className="ml-2 text-sm font-medium text-muted-foreground">pilot</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm" aria-label="Site">
          <Link href="/faq" className="text-muted-foreground hover:text-foreground">FAQ</Link>
          <Link href="/help" className="text-muted-foreground hover:text-foreground">Help</Link>
          <button type="button" className="text-muted-foreground hover:text-foreground" aria-pressed={dark} onClick={toggleTheme}>
            {dark ? "Light" : "Dark"}
          </button>
          {participant ? (
            <Button variant="outline" size="sm" type="button" disabled={leaving} onClick={signOut}>
              {leaving ? "Signing out…" : "Sign out"}
            </Button>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
