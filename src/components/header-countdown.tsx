"use client";

import { usePathname } from "next/navigation";
import { Countdown } from "@/components/countdown";

/**
 * Contagem regressiva no canto superior das telas do painel.
 * Some na Visão geral (/dashboard), onde a contagem aparece ao lado do nome.
 */
export function HeaderCountdown({ date }: { date: string | null }) {
  const pathname = usePathname();
  if (pathname === "/dashboard") return null;
  return <Countdown date={date} />;
}
