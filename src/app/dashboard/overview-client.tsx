"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Handshake,
  Users,
  MapPin,
  CreditCard,
  CalendarDays,
  ListChecks,
  type LucideIcon,
} from "lucide-react";
import { Countdown } from "@/components/countdown";
import { OWNER_LABEL } from "@/components/owner-tabs";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/format";
import { venueTotal } from "@/lib/finance";
import type { Venue, Responsavel } from "@/lib/types";

type VendorRow = { valor_total: number | null; status: string | null };
type LocalRow = Record<string, unknown> & {
  id: string;
  nome: string | null;
  is_selected: boolean | null;
};
type AgendaRow = {
  titulo: string | null;
  data: string | null;
  horario: string | null;
  responsavel: string | null;
};

const CARD_CLS =
  "relative overflow-hidden rounded-[20px] border border-[rgba(255,255,255,0.8)] p-6 shadow-[0_14px_36px_rgba(156,108,60,0.14),inset_0_1px_0_rgba(255,255,255,0.95)]";
const CARD_BG = {
  background: "rgba(255,255,255,0.38)",
  backdropFilter: "blur(28px) saturate(190%)",
  WebkitBackdropFilter: "blur(28px) saturate(190%)",
} as const;

function Sheen() {
  return (
    <div
      className="pointer-events-none absolute left-[-30%] top-[-60%] h-[80%] w-[160%]"
      style={{
        background:
          "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.55) 48%, transparent 66%)",
        backgroundSize: "220% 100%",
        animation: "wpShimmer 7s linear infinite",
      }}
    />
  );
}

function venueCostOf(r: LocalRow | null): number {
  if (!r) return 0;
  const v: Venue = {
    id: r.id,
    name: (r.nome as string) ?? "",
    type: "",
    address: "",
    totalGuests: (r.convidados_total as number) ?? 0,
    fullGuests: (r.convidados_inteira as number) ?? 0,
    halfGuests: (r.convidados_meia as number) ?? 0,
    freeGuests: (r.convidados_nao_pagantes as number) ?? 0,
    pricePerFull: (r.valor_inteira as number) ?? 0,
    pricePerHalf: (r.valor_meia as number) ?? 0,
    taxPercent: (r.taxa_percentual as number) ?? 0,
    services: (r.servicos_adicionais as Venue["services"]) ?? [],
    notes: "",
    isSelected: !!r.is_selected,
  };
  return venueTotal(v);
}

function rise(i: number) {
  return {
    ...CARD_BG,
    animation: "wpRise 500ms ease-out both",
    animationDelay: `${i * 70}ms`,
  } as const;
}

function MetricCard({
  icon: Icon,
  label,
  value,
  href,
  index,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  href: string;
  index: number;
}) {
  return (
    <Link href={href}>
      <div className={`${CARD_CLS} h-full`} style={rise(index)}>
        <Sheen />
        <div className="gold-chip flex h-10 w-10 items-center justify-center rounded-[11px]">
          <Icon size={20} strokeWidth={1.8} className="text-[#9C6C3C]" />
        </div>
        <div className="mt-3.5 text-[13px] text-[#8a7b63]">{label}</div>
        <div className="font-display mt-1 truncate text-[26px] font-bold text-[#9C6C3C]">
          {value}
        </div>
      </div>
    </Link>
  );
}

export function DashboardOverview({
  title,
  date,
  budget,
  guestCount,
  confirmedPeople,
}: {
  title: string;
  date: string | null;
  budget: number | null;
  guestCount: number;
  confirmedPeople: number;
}) {
  const [vendors, setVendors] = useState<VendorRow[]>([]);
  const [venue, setVenue] = useState<LocalRow | null>(null);
  const [agenda, setAgenda] = useState<AgendaRow[]>([]);
  const [checklist, setChecklist] = useState<{ concluido: boolean | null }[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const [f, l, a, ch] = await Promise.all([
        sb.from("fornecedores").select("valor_total, status"),
        sb.from("local").select("*"),
        sb.from("agenda").select("titulo, data, horario, responsavel"),
        sb.from("checklist").select("concluido"),
      ]);
      setVendors((f.data as VendorRow[]) ?? []);
      const locals = (l.data as LocalRow[]) ?? [];
      setVenue(locals.find((x) => x.is_selected) ?? locals[0] ?? null);
      setAgenda((a.data as AgendaRow[]) ?? []);
      setChecklist((ch.data as { concluido: boolean | null }[]) ?? []);
      setLoaded(true);
    })();
  }, []);

  const venueCost = venueCostOf(venue);
  const vendorSpent = vendors
    .filter((v) => v.status === "contratado" || v.status === "pago")
    .reduce((acc, v) => acc + (v.valor_total ?? 0), 0);
  const spent = vendorSpent + venueCost;

  const nowDate = new Date();
  const todayKey = `${nowDate.getFullYear()}-${String(nowDate.getMonth() + 1).padStart(2, "0")}-${String(nowDate.getDate()).padStart(2, "0")}`;
  const nextAppt = [...agenda]
    .filter((a) => a.data && a.data >= todayKey)
    .sort((a, b) => `${a.data}T${a.horario}`.localeCompare(`${b.data}T${b.horario}`))[0];

  const done = checklist.filter((c) => c.concluido).length;
  const pct = checklist.length === 0 ? 0 : Math.round((done / checklist.length) * 100);

  const stats: { icon: LucideIcon; label: string; value: string; href: string }[] = [
    { icon: Handshake, label: "Fornecedores", value: String(vendors.length), href: "/dashboard/vendors" },
    { icon: Users, label: "Convidados confirmados", value: `${confirmedPeople} / ${guestCount}`, href: "/dashboard/guests" },
    { icon: MapPin, label: "Local", value: venue ? ((venue.nome as string) || "Sem nome") : "Não definido", href: "/dashboard/venues" },
    { icon: CreditCard, label: "Gasto contratado", value: formatCurrency(spent), href: "/dashboard/vendors" },
  ];

  return (
    <div>
      <header className="mb-9 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-[13px] font-bold tracking-[0.04em] text-[#8a7b63]">
            Nosso casamento
          </div>
          <h1 className="font-display mt-1.5 text-[44px] font-bold leading-none text-[#2B2620]">
            {title}
          </h1>
          <div className="mt-2 text-[15px] text-[#8a7b63]">
            {date ? formatDate(date) : "Data ainda não definida"}
          </div>
        </div>
        <Countdown date={date} />
      </header>

      {!loaded ? (
        <p className="text-[#8a7b63]">Carregando...</p>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((s, i) => (
              <MetricCard key={s.label} {...s} index={i} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className={CARD_CLS} style={rise(4)}>
              <Sheen />
              <div className="flex items-center gap-2.5">
                <CalendarDays size={19} strokeWidth={1.8} className="text-[#9C6C3C]" />
                <div className="text-[15px] font-bold text-[#2B2620]">Próximo compromisso</div>
              </div>
              {nextAppt ? (
                <Link href="/dashboard/agenda" className="mt-3.5 block">
                  <p className="font-bold text-[#2B2620]">{nextAppt.titulo}</p>
                  <p className="text-sm text-[#8a7b63]">
                    {nextAppt.data && formatDate(nextAppt.data)}
                    {nextAppt.horario && ` · ${nextAppt.horario.slice(0, 5)}`}
                    {` · ${OWNER_LABEL[(nextAppt.responsavel ?? "ambos") as Responsavel]}`}
                  </p>
                </Link>
              ) : (
                <Link href="/dashboard/agenda" className="mt-3.5 block text-sm leading-relaxed text-[#8a7b63] hover:text-[#9C6C3C]">
                  Nenhum compromisso futuro. Toque para adicionar.
                </Link>
              )}
            </div>

            <div className={CARD_CLS} style={rise(5)}>
              <Sheen />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ListChecks size={19} strokeWidth={1.8} className="text-[#9C6C3C]" />
                  <div className="text-[15px] font-bold text-[#2B2620]">Checklist</div>
                </div>
                <Link href="/dashboard/checklist" className="text-[13px] font-bold text-[#8a7b63] hover:text-[#9C6C3C]">
                  {done}/{checklist.length} ({pct}%)
                </Link>
              </div>
              <div className="mt-[18px] h-2 overflow-hidden rounded-full bg-[rgba(180,144,84,0.14)]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    background: "linear-gradient(90deg,#FCEFC0,#D8B478,#B49054)",
                    transition: "width 900ms cubic-bezier(0.22,1,0.36,1)",
                  }}
                />
              </div>
            </div>
          </div>

          {budget != null && budget > 0 && (
            <div className={`${CARD_CLS} mt-5`} style={CARD_BG}>
              <Sheen />
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-[#2B2620]">Orçamento</p>
                <p className="text-sm text-[#8a7b63]">
                  {formatCurrency(spent)} de {formatCurrency(budget)}
                </p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[rgba(180,144,84,0.14)]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, (spent / budget) * 100).toFixed(1)}%`,
                    background: "linear-gradient(90deg,#FCEFC0,#D8B478,#B49054)",
                  }}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
