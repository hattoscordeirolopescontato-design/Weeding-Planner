"use client";

import type { Responsavel } from "@/lib/types";

export const OWNER_LABEL: Record<Responsavel, string> = {
  ambos: "Ambos",
  noivo: "Noivo",
  noiva: "Noiva",
};

const TABS: Responsavel[] = ["ambos", "noivo", "noiva"];

export function OwnerTabs({
  value,
  onChange,
}: {
  value: Responsavel;
  onChange: (v: Responsavel) => void;
}) {
  return (
    <div className="mb-5 inline-flex rounded-xl border border-[rgba(180,144,84,0.25)] bg-[rgba(156,108,60,0.05)] p-1">
      {TABS.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
            value === t
              ? "btn-gold font-bold shadow-[0_4px_12px_rgba(156,108,60,0.22)]"
              : "text-[#6B5F4F] hover:text-[#2B2620]"
          }`}
        >
          {OWNER_LABEL[t]}
        </button>
      ))}
    </div>
  );
}
