"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { usePilot } from "@/components/pilot-context";

export default function PortalIndex() {
  const { participant, ready } = usePilot();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!participant) router.replace("/portal/invite");
    else if (participant.status === "invited") router.replace("/portal/agreements");
    else if (participant.status === "active") router.replace("/portal/test");
    else router.replace("/portal/access");
  }, [participant, ready, router]);

  return <p className="text-sm text-muted-foreground">Opening your step…</p>;
}
