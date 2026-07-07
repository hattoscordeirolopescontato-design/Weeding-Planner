"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  MapPin,
  Shirt,
  Users,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Card, PageHeader, Button, Field, Input, Select, Textarea, Badge } from "@/components/ui";
import { OwnerTabs, OWNER_LABEL } from "@/components/owner-tabs";
import { useList } from "@/lib/supabase/hooks";
import { formatDate } from "@/lib/format";
import type { AgendaType, Responsavel } from "@/lib/types";

type Row = {
  id: string;
  titulo: string | null;
  data: string | null;
  horario: string | null;
  descricao: string | null;
  tipo: string | null;
  responsavel: string | null;
};

const TYPE_META: Record<AgendaType, { label: string; icon: typeof MapPin }> = {
  visita: { label: "Visita a fornecedor", icon: MapPin },
  prova: { label: "Prova de roupa", icon: Shirt },
  reuniao: { label: "Reunião", icon: Users },
  outro: { label: "Outro", icon: CalendarIcon },
};

const blank = {
  titulo: "",
  data: "",
  horario: "",
  descricao: "",
  tipo: "visita" as AgendaType,
};

export default function AgendaPage() {
  const { rows, loading, error, add, remove } = useList<Row>("agenda");
  const [tab, setTab] = useState<Responsavel>("ambos");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(blank);

  const tabItems = rows
    .filter((i) => (i.responsavel ?? "ambos") === tab)
    .sort((a, b) =>
      `${a.data}T${a.horario}`.localeCompare(`${b.data}T${b.horario}`),
    );

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.titulo.trim() || !draft.data) return;
    await add({
      titulo: draft.titulo,
      data: draft.data,
      horario: draft.horario || null,
      descricao: draft.descricao,
      tipo: draft.tipo,
      responsavel: tab,
    } as Partial<Row>);
    setDraft(blank);
    setAdding(false);
  }
  async function del(id: string) {
    if (!window.confirm("Excluir este compromisso?")) return;
    await remove(id);
  }

  return (
    <div>
      <PageHeader
        title="Agenda"
        subtitle="Compromissos do casamento, separados por responsável."
      />
      {error && <Card className="mb-4 text-sm text-rose-700">Erro: {error}</Card>}

      <OwnerTabs value={tab} onChange={setTab} />

      <div className="mb-6">
        {adding ? (
          <Card>
            <form onSubmit={addItem} className="flex flex-col gap-4">
              <Field label={`Título (${OWNER_LABEL[tab]})`}>
                <Input
                  value={draft.titulo}
                  onChange={(e) => setDraft({ ...draft, titulo: e.target.value })}
                  required
                />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Data">
                  <Input
                    type="date"
                    value={draft.data}
                    onChange={(e) => setDraft({ ...draft, data: e.target.value })}
                    required
                  />
                </Field>
                <Field label="Horário">
                  <Input
                    type="time"
                    value={draft.horario}
                    onChange={(e) => setDraft({ ...draft, horario: e.target.value })}
                  />
                </Field>
                <Field label="Tipo">
                  <Select
                    value={draft.tipo}
                    onChange={(e) =>
                      setDraft({ ...draft, tipo: e.target.value as AgendaType })
                    }
                  >
                    {Object.entries(TYPE_META).map(([v, m]) => (
                      <option key={v} value={v}>
                        {m.label}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <Field label="Descrição">
                <Textarea
                  value={draft.descricao}
                  onChange={(e) => setDraft({ ...draft, descricao: e.target.value })}
                />
              </Field>
              <div className="flex items-center gap-3">
                <Button type="submit">Adicionar compromisso</Button>
                <Button type="button" variant="ghost" onClick={() => setAdding(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <Button onClick={() => setAdding(true)}>
            <Plus size={16} /> Adicionar compromisso
          </Button>
        )}
      </div>

      {loading ? (
        <p className="text-[#8a7b63]">Carregando...</p>
      ) : tabItems.length === 0 ? (
        <Card className="text-center text-[#8a7b63]">
          Nenhum compromisso para {OWNER_LABEL[tab]} ainda.
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {tabItems.map((it) => {
            const meta = TYPE_META[(it.tipo ?? "outro") as AgendaType] ?? TYPE_META.outro;
            const Icon = meta.icon;
            return (
              <Card key={it.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <div className="mt-0.5 rounded-xl bg-[rgba(156,108,60,0.08)] p-2 text-[#9C6C3C]">
                      <Icon size={18} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#2B2620]">{it.titulo}</h3>
                      <p className="text-sm text-[#8a7b63]">
                        {it.data && formatDate(it.data)}
                        {it.horario && ` · ${it.horario.slice(0, 5)}`}
                      </p>
                      <div className="mt-1">
                        <Badge tone="terracota">{meta.label}</Badge>
                      </div>
                      {it.descricao && (
                        <p className="mt-2 text-sm text-[#8a7b63]">{it.descricao}</p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => del(it.id)}
                    className="text-[#b7a98c] hover:text-rose-600"
                    aria-label="Excluir compromisso"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
