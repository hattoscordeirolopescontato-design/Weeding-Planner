"use client";

import { useState } from "react";
import { Building2, Trees, Hotel, Tent, Plus, Trash2, Download, Users } from "lucide-react";
import { Field, Input, Select, Textarea, Button } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/format";
import {
  venueGuestBase,
  venueServicesTotal,
  venueSubtotal,
  venueTaxAmount,
  venueTotal,
} from "@/lib/finance";
import { uid } from "@/lib/use-local-store";
import type { Venue, VenueType, VenueChargeType, VenueService } from "@/lib/types";

export type VenueInput = Omit<Venue, "id">;

const TYPES: { value: VenueType; label: string; icon: typeof Building2 }[] = [
  { value: "salao", label: "Salão de Festas", icon: Building2 },
  { value: "chacara", label: "Chácara/Sítio", icon: Trees },
  { value: "hotel", label: "Hotel/Resort", icon: Hotel },
  { value: "externo", label: "Espaço Externo", icon: Tent },
];

const CHARGE_LABEL: Record<VenueChargeType, string> = {
  per_person_all: "Por pessoa (todos)",
  per_person_paying: "Por pessoa (pagantes)",
  per_child: "Por criança",
  fixed: "Valor fixo",
};

const blank: VenueInput = {
  name: "",
  type: "",
  address: "",
  totalGuests: 0,
  fullGuests: 0,
  halfGuests: 0,
  freeGuests: 0,
  pricePerFull: 0,
  pricePerHalf: 0,
  taxPercent: 0,
  services: [],
  notes: "",
  isSelected: false,
};

const num = (s: string) => {
  const n = parseFloat(s.replace(",", "."));
  return isNaN(n) ? 0 : n;
};

export function VenueForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Venue;
  onSubmit: (data: VenueInput) => void;
  onCancel?: () => void;
}) {
  const [data, setData] = useState<VenueInput>(() =>
    initial ? { ...initial } : blank,
  );
  const [halfTouched, setHalfTouched] = useState(
    !!initial && initial.pricePerHalf !== initial.pricePerFull / 2,
  );

  const [importMsg, setImportMsg] = useState("");

  const set = <K extends keyof VenueInput>(key: K, value: VenueInput[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  // Preenche as contagens de cobrança a partir dos convidados confirmados.
  async function importarConvidados() {
    const sb = createClient();
    const { data: guests, error } = await sb
      .from("convidados")
      .select("tipo_pagamento, acompanhantes")
      .neq("status", "recusado");
    if (error) {
      setImportMsg(
        `Erro do banco: ${error.message}. Provavelmente falta rodar no Supabase: alter table convidados add column if not exists tipo_pagamento text default 'inteira';`,
      );
      return;
    }
    let inteira = 0,
      meia = 0,
      nao = 0,
      acomp = 0;
    for (const g of guests ?? []) {
      acomp += (g.acompanhantes as number) ?? 0;
      const t = (g.tipo_pagamento as string) ?? "inteira";
      if (t === "meia") meia++;
      else if (t === "nao_pagante") nao++;
      else inteira++;
    }
    inteira += acomp; // acompanhantes contam como inteira
    const total = inteira + meia + nao;
    setData((d) => ({
      ...d,
      totalGuests: total,
      fullGuests: inteira,
      halfGuests: meia,
      freeGuests: nao,
    }));
    setImportMsg(
      total === 0
        ? "Nenhum convidado encontrado. Verifique se há convidados cadastrados (e se rodou o ALTER de tipo_pagamento no Supabase)."
        : `Importados ${total} convidados (confirmados + pendentes; acompanhantes contam como inteira).`,
    );
  }

  // Exporta a lista de convidados em CSV (para fechar a conta com o salão).
  async function exportarConvidados() {
    const sb = createClient();
    const { data: guests } = await sb
      .from("convidados")
      .select("nome, grupo, status, tipo_pagamento, acompanhantes, email, telefone")
      .order("nome");
    const header = [
      "Nome",
      "Grupo",
      "Status",
      "Pagamento",
      "Acompanhantes",
      "Email",
      "Telefone",
    ];
    const cell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = [
      header.join(","),
      ...(guests ?? []).map((g) =>
        [
          g.nome,
          g.grupo,
          g.status,
          g.tipo_pagamento,
          g.acompanhantes,
          g.email,
          g.telefone,
        ]
          .map(cell)
          .join(","),
      ),
    ];
    const blob = new Blob(["﻿" + lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "convidados.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function setFull(value: number) {
    setData((d) => ({
      ...d,
      pricePerFull: value,
      pricePerHalf: halfTouched ? d.pricePerHalf : value / 2,
    }));
  }

  function addService() {
    const s: VenueService = {
      id: uid(),
      name: "",
      chargeType: "per_person_all",
      unitValue: 0,
      quantity: 0,
      inTaxBase: true,
    };
    set("services", [...data.services, s]);
  }
  function updateService(id: string, patch: Partial<VenueService>) {
    set(
      "services",
      data.services.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    );
  }
  function removeService(id: string) {
    set(
      "services",
      data.services.filter((s) => s.id !== id),
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!data.name.trim() || !data.type) return;
    onSubmit(data);
    if (!initial) {
      setData(blank);
      setHalfTouched(false);
    }
  }

  const preview: Venue = { id: "preview", ...data };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      {/* Tipo de local (obrigatório) */}
      <div>
        <p className="mb-2 text-sm font-medium text-[#2B2620]">Tipo de local</p>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => {
            const Icon = t.icon;
            const active = data.type === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => set("type", t.value)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "border-[#9C6C3C] bg-[rgba(156,108,60,0.14)] text-[#2B2620]"
                    : "border-[rgba(180,144,84,0.3)] bg-[rgba(156,108,60,0.05)] text-[#6B5F4F] hover:bg-[rgba(156,108,60,0.1)]"
                }`}
              >
                <Icon size={16} /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nome do local">
          <Input
            value={data.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
        </Field>
        <Field label="Endereço completo">
          <Input
            value={data.address}
            onChange={(e) => set("address", e.target.value)}
            placeholder="Rua, número, bairro, cidade"
          />
        </Field>
      </div>

      {/* Cobrança de convidados */}
      <div className="rounded-xl bg-[rgba(156,108,60,0.05)] p-4">
        <p className="mb-3 text-sm font-semibold text-[#2B2620]">
          Cobrança de convidados
        </p>
        <div className="mb-4 flex flex-wrap gap-2">
          <Button type="button" variant="ghost" onClick={importarConvidados}>
            <Users size={15} /> Importar convidados
          </Button>
          <Button type="button" variant="ghost" onClick={exportarConvidados}>
            <Download size={15} /> Exportar convidados (CSV)
          </Button>
        </div>
        {importMsg && (
          <p className="mb-3 text-sm font-medium text-emerald-700">{importMsg}</p>
        )}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Total de convidados">
            <Input
              type="number"
              min="0"
              value={data.totalGuests || ""}
              onChange={(e) => set("totalGuests", num(e.target.value))}
            />
          </Field>
          <Field label="Inteira">
            <Input
              type="number"
              min="0"
              value={data.fullGuests || ""}
              onChange={(e) => set("fullGuests", num(e.target.value))}
            />
          </Field>
          <Field label="Meia entrada">
            <Input
              type="number"
              min="0"
              value={data.halfGuests || ""}
              onChange={(e) => set("halfGuests", num(e.target.value))}
            />
          </Field>
          <Field label="Não pagantes">
            <Input
              type="number"
              min="0"
              value={data.freeGuests || ""}
              onChange={(e) => set("freeGuests", num(e.target.value))}
            />
          </Field>
          <Field label="Valor por pessoa — inteira (R$)">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={data.pricePerFull || ""}
              onChange={(e) => setFull(num(e.target.value))}
            />
          </Field>
          <Field label="Valor meia entrada (R$)" hint="Padrão: 50% da inteira">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={data.pricePerHalf || ""}
              onChange={(e) => {
                setHalfTouched(true);
                set("pricePerHalf", num(e.target.value));
              }}
            />
          </Field>
          <Field label="Taxa sobre o total (%)">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={data.taxPercent || ""}
              onChange={(e) => set("taxPercent", num(e.target.value))}
              placeholder="Ex.: 13"
            />
          </Field>
        </div>
      </div>

      {/* Serviços adicionais */}
      <div className="rounded-xl bg-[rgba(156,108,60,0.05)] p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-[#2B2620]">Serviços adicionais</p>
          <button
            type="button"
            onClick={addService}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#9C6C3C] hover:text-[#2B2620]"
          >
            <Plus size={15} /> Adicionar serviço
          </button>
        </div>

        {data.services.length === 0 ? (
          <p className="text-sm text-[#b7a98c]">
            Nenhum serviço. Ex.: Suco, Brinquedoteca, Open Bar.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {data.services.map((s) => {
              const showQty = s.chargeType === "per_child" || s.chargeType === "fixed";
              return (
                <div
                  key={s.id}
                  className="grid grid-cols-1 gap-3 rounded-lg bg-[rgba(156,108,60,0.05)] p-3 sm:grid-cols-12"
                >
                  <div className="sm:col-span-4">
                    <Field label="Nome">
                      <Input
                        value={s.name}
                        onChange={(e) =>
                          updateService(s.id, { name: e.target.value })
                        }
                        placeholder="Ex.: Open Bar"
                      />
                    </Field>
                  </div>
                  <div className="sm:col-span-3">
                    <Field label="Cobrança">
                      <Select
                        value={s.chargeType}
                        onChange={(e) =>
                          updateService(s.id, {
                            chargeType: e.target.value as VenueChargeType,
                          })
                        }
                      >
                        {Object.entries(CHARGE_LABEL).map(([v, l]) => (
                          <option key={v} value={v}>
                            {l}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="Valor unit. (R$)">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={s.unitValue || ""}
                        onChange={(e) =>
                          updateService(s.id, { unitValue: num(e.target.value) })
                        }
                      />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    {showQty && (
                      <Field
                        label={s.chargeType === "per_child" ? "Crianças que pagam" : "Qtd"}
                        hint={s.chargeType === "per_child" ? "Ex.: somente acima de 3 anos" : undefined}
                      >
                        <Input
                          type="number"
                          min="0"
                          value={s.quantity || ""}
                          onChange={(e) =>
                            updateService(s.id, { quantity: num(e.target.value) })
                          }
                        />
                      </Field>
                    )}
                  </div>
                  <div className="flex items-end justify-between gap-2 sm:col-span-1">
                    <label className="flex items-center gap-1 text-xs text-[#6B5F4F]">
                      <input
                        type="checkbox"
                        checked={s.inTaxBase}
                        onChange={(e) =>
                          updateService(s.id, { inTaxBase: e.target.checked })
                        }
                        className="h-4 w-4 rounded border-[rgba(180,144,84,0.35)] bg-[rgba(156,108,60,0.08)] accent-terracota"
                        title="Entra na base da taxa %"
                      />
                      taxa
                    </label>
                    <button
                      type="button"
                      onClick={() => removeService(s.id)}
                      className="text-[#b7a98c] hover:text-rose-600"
                      aria-label="Remover serviço"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resumo financeiro em tempo real */}
      <div className="rounded-xl border border-[#9C6C3C]/40 bg-terracota/10 p-4">
        <p className="mb-2 text-sm font-semibold text-[#2B2620]">Resumo financeiro</p>
        <dl className="space-y-1 text-sm">
          <div className="mb-2 space-y-0.5 rounded-lg bg-[rgba(156,108,60,0.06)] p-2 text-xs text-[#8a7b63]">
            <div className="flex justify-between">
              <span>
                Inteiras: {data.fullGuests} × {formatCurrency(data.pricePerFull)}
              </span>
              <span>{formatCurrency(data.fullGuests * data.pricePerFull)}</span>
            </div>
            <div className="flex justify-between">
              <span>
                Meias: {data.halfGuests} × {formatCurrency(data.pricePerHalf)}
              </span>
              <span>{formatCurrency(data.halfGuests * data.pricePerHalf)}</span>
            </div>
            <div className="flex justify-between">
              <span>Não pagantes: {data.freeGuests}</span>
              <span>—</span>
            </div>
          </div>
          <Row label="Valor base convidados" value={venueGuestBase(preview)} />
          <Row label="+ Serviços adicionais" value={venueServicesTotal(preview)} />
          <Row label="= Subtotal" value={venueSubtotal(preview)} strong />
          <Row
            label={`+ Taxa ${data.taxPercent || 0}%`}
            value={venueTaxAmount(preview)}
          />
          <div className="mt-2 flex justify-between border-t border-[rgba(180,144,84,0.22)] pt-2 text-base font-semibold text-[#9C6C3C]">
            <span>= TOTAL DO LOCAL</span>
            <span>{formatCurrency(venueTotal(preview))}</span>
          </div>
        </dl>
      </div>

      <Field label="Observações">
        <Textarea value={data.notes} onChange={(e) => set("notes", e.target.value)} />
      </Field>

      <label className="flex items-center gap-2 text-sm font-medium text-[#2B2620]">
        <input
          type="checkbox"
          checked={data.isSelected}
          onChange={(e) => set("isSelected", e.target.checked)}
          className="h-4 w-4 rounded border-[rgba(180,144,84,0.35)] bg-[rgba(156,108,60,0.08)] accent-terracota"
        />
        Este é o local escolhido
      </label>

      <div className="flex items-center gap-3">
        <Button type="submit">{initial ? "Salvar alterações" : "Adicionar local"}</Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: number;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex justify-between ${strong ? "font-semibold text-[#2B2620]" : "text-[#6B5F4F]"}`}
    >
      <span>{label}</span>
      <span>{formatCurrency(value)}</span>
    </div>
  );
}
