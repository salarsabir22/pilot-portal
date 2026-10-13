"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, usePilot } from "./pilot-context";

export function Header() {
  const { participant, setParticipant } = usePilot();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sj-theme");
    const next = saved === "dark";
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    localStorage.setItem("sj-theme", next ? "dark" : "light");
  }

  async function signOut() {
    await api("/api/logout", {});
    setParticipant(null);
    window.location.href = "/";
  }

  return (
    <header>
      <Link href="/" className="logo">
        swypejobs<i>.</i> <span className="mute" style={{ fontWeight: 400 }}>pilot</span>
      </Link>
      <div className="tools">
        <nav className="navlinks" aria-label="Portal">
          <Link className="chip" href="/faq">FAQ</Link>
          <Link className="chip" href="/help">Help</Link>
          <Link className="chip" href="/admin">Founder</Link>
        </nav>
        <button className="chip" type="button" aria-pressed={dark} onClick={toggleTheme}>
          {dark ? "Light" : "Dark"}
        </button>
        {participant ? (
          <button className="chip" type="button" onClick={signOut}>
            {participant.id} · Sign out
          </button>
        ) : null}
      </div>
    </header>
  );
}
