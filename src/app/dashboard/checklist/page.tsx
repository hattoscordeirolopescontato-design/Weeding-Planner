"use client";

import { useEffect, useState } from "react";
import { Plus, Check, Trash2 } from "lucide-react";
import { Card, PageHeader, Field, Input, Select, Button } from "@/components/ui";
import { OwnerTabs, OWNER_LABEL } from "@/components/owner-tabs";
import { useList } from "@/lib/supabase/hooks";
import { createClient } from "@/lib/supabase/client";
import { defaultChecklist, CHECKLIST_CATEGORIES } from "@/lib/checklist-data";
import type { ChecklistCategory, Responsavel } from "@/lib/types";

type Row = {
  id: string;
  titulo: string | null;
  categoria: string | null;
  responsavel: string | null;
  concluido: boolean | null;
  custom: boolean | null;
};

export default function ChecklistPage() {
  const { rows, loading, error, add, update, remove, reload } = useList<Row>("checklist");
  const [tab, setTab] = useState<Responsavel>("ambos");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ChecklistCategory>(CHECKLIST_CATEGORIES[0]);
  const [seeded, setSeeded] = useState(false);

  // Semeia o checklist padrão no primeiro acesso (quando ainda não há itens).
  useEffect(() => {
    if (loading || rows.length > 0 || seeded) return;
    setSeeded(true);
    (async () => {
      const sb = createClient();
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (!user) return;
      const defs = defaultChecklist().map((d) => ({
        user_id: user.id,
        titulo: d.title,
        categoria: d.category,
        responsavel: d.owner,
        concluido: false,
        custom: false,
      }));
      await sb.from("checklist").insert(defs);
      await reload();
    })();
  }, [loading, rows.length, seeded, reload]);

  const ownerOf = (i: Row): Responsavel => (i.responsavel ?? "ambos") as Responsavel;
  const tabItems = rows.filter((i) => ownerOf(i) === tab);
  const total = tabItems.length;
  const done = tabItems.filter((i) => i.concluido).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  async function addCustom(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await add({
      titulo: title.trim(),
      categoria: category,
      responsavel: tab,
      concluido: false,
      custom: true,
    } as Partial<Row>);
    setTitle("");
  }
  async function del(id: string) {
    if (!window.confirm("Excluir esta tarefa?")) return;
    await remove(id);
  }

  return (
    <div>
      <PageHeader
        title="Checklist"
        subtitle="Acompanhe as tarefas do planejamento, separadas por responsável."
      />
      {error && <Card className="mb-4 text-sm text-rose-700">Erro: {error}</Card>}

      <OwnerTabs value={tab} onChange={setTab} />

      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-[#2B2620]">
            Progresso — {OWNER_LABEL[tab]}
          </p>
          <p className="text-sm text-[#8a7b63]">
            {done} de {total} ({pct}%)
          </p>
        </div>
        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-[rgba(156,108,60,0.08)]">
          <div
            className="h-full rounded-full bg-terracota transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </Card>

      <Card className="mb-6">
        <form onSubmit={addCustom} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Field label={`Nova tarefa (${OWNER_LABEL[tab]})`}>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex.: Agendar degustação do bolo"
              />
            </Field>
          </div>
          <div className="sm:w-56">
            <Field label="Categoria">
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value as ChecklistCategory)}
              >
                {CHECKLIST_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Button type="submit">
            <Plus size={16} /> Adicionar
          </Button>
        </form>
      </Card>

      {loading ? (
        <p className="text-[#8a7b63]">Carregando...</p>
      ) : tabItems.length === 0 ? (
        <Card className="text-center text-[#8a7b63]">
          Nenhuma tarefa para {OWNER_LABEL[tab]} ainda.
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {CHECKLIST_CATEGORIES.map((cat) => {
            const group = tabItems.filter((i) => i.categoria === cat);
            if (group.length === 0) return null;
            const gdone = group.filter((i) => i.concluido).length;
            return (
              <div key={cat}>
                <h2 className="font-display mb-2 text-xl font-semibold text-[#9C6C3C]">
                  {cat}{" "}
                  <span className="text-sm font-normal text-[#b7a98c]">
                    ({gdone}/{group.length})
                  </span>
                </h2>
                <Card className="!p-3">
                  <ul className="flex flex-col">
                    {group.map((i) => (
                      <li
                        key={i.id}
                        className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-[rgba(156,108,60,0.05)]"
                      >
                        <button
                          type="button"
                          onClick={() => update(i.id, { concluido: !i.concluido } as Partial<Row>)}
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                            i.concluido
                              ? "border-[#9C6C3C] bg-[#9C6C3C] text-white"
                              : "border-[rgba(180,144,84,0.4)] bg-[rgba(156,108,60,0.05)]"
                          }`}
                          aria-label={i.concluido ? "Desmarcar" : "Marcar como concluído"}
                        >
                          {i.concluido && <Check size={14} strokeWidth={3} />}
                        </button>
                        <span
                          className={`flex-1 text-sm ${
                            i.concluido ? "text-[#b7a98c] line-through" : "text-[#2B2620]"
                          }`}
                        >
                          {i.titulo}
                        </span>
                        <button
                          type="button"
                          onClick={() => del(i.id)}
                          className="text-[#b7a98c] hover:text-rose-600"
                          aria-label="Remover tarefa"
                        >
                          <Trash2 size={15} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
