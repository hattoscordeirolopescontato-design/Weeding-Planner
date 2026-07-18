"use client";

import { useEffect, useState } from "react";

function parseLocal(date: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(date);
  const d = m
    ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    : new Date(date);
  return d.getTime();
}

export function Countdown({ date }: { date: string | null }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!date) return null;

  const diff = now === null ? 0 : parseLocal(date) - now;

  if (now !== null && diff <= 0) {
    return (
      <span className="btn-gold inline-flex items-center rounded-full px-4 py-1.5 text-sm font-black shadow-[0_8px_20px_rgba(156,108,60,0.24)]">
        Chegou o grande dia!
      </span>
    );
  }

  const pad = (n: number) => String(n).padStart(2, "0");
  const units: { label: string; value: string }[] = [
    { label: "Dias", value: now === null ? "--" : String(Math.floor(diff / 86400000)) },
    { label: "Horas", value: now === null ? "--" : pad(Math.floor(diff / 3600000) % 24) },
    { label: "Minutos", value: now === null ? "--" : pad(Math.floor(diff / 60000) % 60) },
    { label: "Segundos", value: now === null ? "--" : pad(Math.floor(diff / 1000) % 60) },
  ];

  return (
    <div className="flex items-center gap-2.5">
      {units.map((u) => (
        <div
          key={u.label}
          className="flex min-w-[68px] flex-col items-center justify-center rounded-2xl border border-[rgba(255,255,255,0.8)] px-3 py-2.5 shadow-[0_10px_26px_rgba(156,108,60,0.12),inset_0_1px_0_rgba(255,255,255,0.95)]"
          style={{
            background: "rgba(255,255,255,0.38)",
            backdropFilter: "blur(28px) saturate(190%)",
            WebkitBackdropFilter: "blur(28px) saturate(190%)",
          }}
        >
          <span className="font-display text-2xl font-bold leading-none tabular-nums text-[#9C6C3C]">
            {u.value}
          </span>
          <span className="mt-1 text-[10px] font-bold uppercase tracking-wide text-[#8a7b63]">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}
