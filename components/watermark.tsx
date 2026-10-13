"use client";

import { useEffect, useState } from "react";
import { usePilot } from "./pilot-context";

export function Watermark() {
  const { participant } = usePilot();
  const [now, setNow] = useState("");

  useEffect(() => {
    const tick = () => setNow(new Date().toLocaleString("en-GB", { hour12: false }));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  if (participant?.status !== "active") return null;
  const label = `${participant.identity?.name || "Participant"} · ${participant.id} · ${now}`;
  return (
    <div className="watermark" aria-hidden="true">
      {Array.from({ length: 18 }, (_, index) => (
        <span key={index}>{label}</span>
      ))}
    </div>
  );
}
