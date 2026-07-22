"use client";

import { useState } from "react";
import { Plus, Check, X, HelpCircle, Pencil, Trash2 } from "lucide-react";
import { Card, Badge, PageHeader, Button, Field, Input, Select, Textarea } from "@/components/ui";
import { useList } from "@/lib/supabase/hooks";

type Convidado = {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  grupo: string | null;
  status: string;
  tipo_pagamento: string | null;
  acompanhantes: number;
  mesa: string | null;
  observacoes: string | null;
};

const PAGAMENTO_LABEL: Record<string, string> = {
  inteira: "Inteira",
  meia: "Meia",
  nao_pagante: "Não pagante",
};
const PAGAMENTO_TONE: Record<string, "terracota" | "blue" | "stone"> = {
  inteira: "terracota",
  meia: "blue",
  nao_pagante: "stone",
};

const RSVP_TONE: Record<string, "green" | "amber" | "stone"> = {
  confirmado: "green",
  pendente: "amber",
  recusado: "stone",
};
const RSVP_LABEL: Record<string, string> = {
  confirmado: "Confirmado",
  pendente: "Pendente",
  recusado: "Recusado",
};
const RSVP_ICON = { confirmado: Check, recusado: X, pendente: HelpCircle } as const;

const blank = {
  nome: "",
  email: "",
  telefone: "",
  grupo: "",
  status: "pendente",
  tipo_pagamento: "inteira",
  acompanhantes: 0,
  mesa: "",
  observacoes: "",
};

const int = (s: string) => {
  const n = parseInt(s, 10);
  return isNaN(n) ? 0 : n;
};

export default function GuestsPage() {
  const { rows, loading, error, add, update, remove } = useList<Convidado>("convidados");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(blank);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState(blank);
  const [filter, setFilter] = useState<"todos" | "confirmado" | "pendente" | "recusado">("todos");

  const confirmed = rows.filter((g) => g.status === "confirmado");
  const totalPeople = confirmed.reduce((a, g) => a + 1 + (g.acompanhantes ?? 0), 0);
  const naoRecusados = rows.filter((g) => g.status !== "recusado");
  const bdInteira =
    naoRecusados.filter((g) => (g.tipo_pagamento ?? "inteira") === "inteira").length +
    naoRecusados.reduce((a, g) => a + (g.acompanhantes ?? 0), 0);
  const bdMeia = naoRecusados.filter((g) => g.tipo_pagamento === "meia").length;
  const bdNao = naoRecusados.filter((g) => g.tipo_pagamento === "nao_pagante").length;
  const visible = filter === "todos" ? rows : rows.filter((g) => g.status === filter);
  const summary = [
    { label: "Confirmados", value: confirmed.length, tone: "text-emerald-700" },
    { label: "Pendentes", value: rows.filter((g) => g.status === "pendente").length, tone: "text-amber-700" },
    { label: "Recusados", value: rows.filter((g) => g.status === "recusado").length, tone: "text-[#8a7b63]" },
    { label: "Total de pessoas", value: totalPeople, tone: "text-[#9C6C3C]" },
  ];

  async function addGuest(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.nome.trim()) return;
    await add(draft);
    setDraft(blank);
    setAdding(false);
  }
  function startEdit(g: Convidado) {
    setEditingId(g.id);
    setEditDraft({
      nome: g.nome ?? "",
      email: g.email ?? "",
      telefone: g.telefone ?? "",
      grupo: g.grupo ?? "",
      status: g.status,
      tipo_pagamento: g.tipo_pagamento ?? "inteira",
      acompanhantes: g.acompanhantes ?? 0,
      mesa: g.mesa ?? "",
      observacoes: g.observacoes ?? "",
    });
  }
  async function saveEdit() {
    if (!editingId) return;
    await update(editingId, editDraft);
    setEditingId(null);
  }
  async function del(id: string) {
    if (!window.confirm("Excluir este convidado?")) return;
    await remove(id);
  }

  const fields = (
    d: typeof blank,
    setD: (v: typeof blank) => void,
  ) => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="Nome">
        <Input value={d.nome} onChange={(e) => setD({ ...d, nome: e.target.value })} required />
      </Field>
      <Field label="Grupo" hint="Ex.: Família da noiva">
        <Input value={d.grupo} onChange={(e) => setD({ ...d, grupo: e.target.value })} />
      </Field>
      <Field label="E-mail">
        <Input type="email" value={d.email} onChange={(e) => setD({ ...d, email: e.target.value })} />
      </Field>
      <Field label="Telefone">
        <Input value={d.telefone} onChange={(e) => setD({ ...d, telefone: e.target.value })} />
      </Field>
      <Field label="Presença">
        <Select value={d.status} onChange={(e) => setD({ ...d, status: e.target.value })}>
          <option value="pendente">Pendente</option>
          <option value="confirmado">Confirmado</option>
          <option value="recusado">Recusado</option>
        </Select>
      </Field>
      <Field label="Pagamento" hint="Usado na conta do salão">
        <Select
          value={d.tipo_pagamento}
          onChange={(e) => setD({ ...d, tipo_pagamento: e.target.value })}
        >
          <option value="inteira">Inteira</option>
          <option value="meia">Meia</option>
          <option value="nao_pagante">Não pagante</option>
        </Select>
      </Field>
      <Field label="Acompanhantes">
        <Input
          type="number"
          min="0"
          value={d.acompanhantes || ""}
          onChange={(e) => setD({ ...d, acompanhantes: int(e.target.value) })}
        />
      </Field>
      <Field label="Mesa">
        <Input value={d.mesa} onChange={(e) => setD({ ...d, mesa: e.target.value })} />
      </Field>
      <Field label="Observações">
        <Textarea value={d.observacoes} onChange={(e) => setD({ ...d, observacoes: e.target.value })} />
      </Field>
    </div>
  );

  return (
    <div>
      <PageHeader title="Convidados" subtitle="Gerencie a lista e acompanhe as confirmações." />

      {error && (
        <Card className="mb-4 text-sm text-rose-700">Erro: {error}</Card>
      )}

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {summary.map((s) => (
          <Card key={s.label} className="!p-4">
            <p className="text-xs text-[#8a7b63]">{s.label}</p>
            <p className={`text-2xl font-semibold ${s.tone}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      <Card className="mb-6 !p-4">
        <p className="text-xs text-[#8a7b63]">Convidados por tipo de pagamento</p>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span className="text-[#9C6C3C]">{bdInteira} inteiras</span>
          <span className="text-sky-700">{bdMeia} meias</span>
          <span className="text-[#8a7b63]">{bdNao} não pagantes</span>
        </div>
        <p className="mt-1 text-xs text-[#b7a98c]">
          Considera confirmados e pendentes (recusados não entram).
          Acompanhantes contam como inteira. É a base usada no cálculo do salão.
        </p>
      </Card>

      <div className="mb-6">
        {adding ? (
          <Card>
            <form onSubmit={addGuest} className="flex flex-col gap-4">
              {fields(draft, setDraft)}
              <div className="flex items-center gap-3">
                <Button type="submit">Adicionar convidado</Button>
                <Button type="button" variant="ghost" onClick={() => setAdding(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <Button onClick={() => setAdding(true)}>
            <Plus size={16} /> Adicionar convidado
          </Button>
        )}
      </div>

      {!loading && rows.length > 0 && (
        <div className="mb-4 inline-flex flex-wrap gap-1 rounded-xl border border-[rgba(180,144,84,0.25)] bg-[rgba(156,108,60,0.05)] p-1">
          {(
            [
              ["todos", "Todos"],
              ["confirmado", "Confirmados"],
              ["pendente", "Pendentes"],
              ["recusado", "Recusados"],
            ] as const
          ).map(([v, l]) => (
            <button
              key={v}
              type="button"
              onClick={() => setFilter(v)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                filter === v
                  ? "bg-[#9C6C3C] text-white"
                  : "text-[#6B5F4F] hover:text-[#2B2620]"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="text-[#8a7b63]">Carregando...</p>
      ) : rows.length === 0 ? (
        <Card className="text-center text-[#8a7b63]">Nenhum convidado ainda.</Card>
      ) : visible.length === 0 ? (
        <Card className="text-center text-[#8a7b63]">
          Nenhum convidado neste filtro.
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((g) =>
            editingId === g.id ? (
              <Card key={g.id}>
                <div className="flex flex-col gap-4">
                  {fields(editDraft, setEditDraft)}
                  <div className="flex items-center gap-3">
                    <Button type="button" onClick={saveEdit}>
                      Salvar
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setEditingId(null)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card key={g.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[#2B2620]">{g.nome}</h3>
                      <Badge tone={RSVP_TONE[g.status] ?? "stone"}>
                        {RSVP_LABEL[g.status] ?? g.status}
                      </Badge>
                      <Badge tone={PAGAMENTO_TONE[g.tipo_pagamento ?? "inteira"] ?? "stone"}>
                        {PAGAMENTO_LABEL[g.tipo_pagamento ?? "inteira"]}
                      </Badge>
                      {g.acompanhantes > 0 && (
                        <span className="text-xs text-[#b7a98c]">+{g.acompanhantes} acomp.</span>
                      )}
                    </div>
                    {g.grupo && <p className="text-sm text-[#8a7b63]">{g.grupo}</p>}
                    <p className="mt-1 text-sm text-[#b7a98c]">
                      {[g.email, g.telefone, g.mesa && `Mesa ${g.mesa}`].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {(["confirmado", "pendente", "recusado"] as const).map((s) => {
                      const Icon = RSVP_ICON[s];
                      return (
                        <button
                          key={s}
                          type="button"
                          title={RSVP_LABEL[s]}
                          onClick={() => update(g.id, { status: s })}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                            g.status === s
                              ? "bg-[#9C6C3C] text-white"
                              : "bg-[rgba(156,108,60,0.08)] text-[#8a7b63] hover:bg-[rgba(156,108,60,0.1)]"
                          }`}
                        >
                          <Icon size={15} />
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-4 border-t border-[rgba(180,144,84,0.18)] pt-3">
                  <button
                    type="button"
                    onClick={() => startEdit(g)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[#9C6C3C] hover:text-[#2B2620]"
                  >
                    <Pencil size={15} /> Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => del(g.id)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[#8a7b63] hover:text-rose-600"
                  >
                    <Trash2 size={15} /> Excluir
                  </button>
                </div>
              </Card>
            ),
          )}
        </div>
      )}
    </div>
  );
}
