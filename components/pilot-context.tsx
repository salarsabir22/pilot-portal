"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { PublicParticipant } from "@/lib/types";

type PilotContextValue = {
  participant: PublicParticipant | null;
  demo: boolean;
  ready: boolean;
  refresh: () => Promise<PublicParticipant | null>;
  setParticipant: (participant: PublicParticipant | null) => void;
};

const PilotContext = createContext<PilotContextValue | null>(null);

export function PilotProvider({ children }: { children: React.ReactNode }) {
  const [participant, setParticipant] = useState<PublicParticipant | null>(null);
  const [demo, setDemo] = useState(false);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const data = (await fetch("/api/me").then((res) => res.json())) as {
      participant: PublicParticipant | null;
      demo?: boolean;
    };
    setParticipant(data.participant);
    setDemo(!!data.demo);
    setReady(true);
    return data.participant;
  }, []);

  useEffect(() => {
    refresh().catch(() => setReady(true));
  }, [refresh]);

  return <PilotContext.Provider value={{ participant, demo, ready, refresh, setParticipant }}>{children}</PilotContext.Provider>;
}

export function usePilot() {
  const value = useContext(PilotContext);
  if (!value) throw new Error("usePilot must be used inside PilotProvider");
  return value;
}

export async function api<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: body ? "POST" : "GET",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = (await res.json()) as T & { error?: string; code?: string };
  if (!res.ok) {
    const error = new Error(data.error || "Something went wrong") as Error & { code?: string };
    error.code = data.code;
    throw error;
  }
  return data;
}
