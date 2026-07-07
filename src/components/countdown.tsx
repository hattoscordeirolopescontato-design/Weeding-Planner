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
    { label: "dias", value: now === null ? "--" : String(Math.floor(diff / 86400000)) },
    { label: "h", value: now === null ? "--" : pad(Math.floor(diff / 3600000) % 24) },
    { label: "min", value: now === null ? "--" : pad(Math.floor(diff / 60000) % 60) },
    { label: "s", value: now === null ? "--" : pad(Math.floor(diff / 1000) % 60) },
  ];

  return (
    <div className="btn-gold inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 shadow-[0_8px_20px_rgba(156,108,60,0.24)]">
      {units.map((u, i) => (
        <div key={u.label} className="flex items-center gap-2.5">
          {i > 0 && <span className="text-[#2B2620]/30">·</span>}
          <span className="text-center leading-none text-[#2B2620]">
            <span className="block text-base font-black tabular-nums">{u.value}</span>
            <span className="block text-[9px] font-bold uppercase tracking-wide opacity-70">
              {u.label}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}
