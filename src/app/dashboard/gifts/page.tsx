"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, ExternalLink, Copy, Share2, Pencil } from "lucide-react";
import { Card, PageHeader, Button, Field, Input, Select, Badge } from "@/components/ui";
import { useList, useSingle } from "@/lib/supabase/hooks";
import { formatCurrency } from "@/lib/format";

type Row = {
  id: string;
  nome: string | null;
  categoria: string | null;
  loja: string | null;
  link: string | null;
  valor: number | null;
  prioridade: string | null;
  status: string | null;
  quem_presenteou: string | null;
};

const CATEGORY_LABEL: Record<string, string> = {
  casa: "Casa",
  eletro: "Eletrodoméstico",
  viagem: "Viagem",
  experiencia: "Experiência",
  outro: "Outro",
};
const PRIORITY_LABEL: Record<string, string> = { alta: "Alta", media: "Média", baixa: "Baixa" };
const PRIORITY_TONE: Record<string, "rose" | "amber" | "stone"> = {
  alta: "rose",
  media: "amber",
  baixa: "stone",
};
const STATUS_LABEL: Record<string, string> = {
  disponivel: "Disponível",
  ganho: "Já ganho",
  reservado: "Reservado",
};
const STATUS_TONE: Record<string, "blue" | "green" | "amber"> = {
  disponivel: "blue",
  ganho: "green",
  reservado: "amber",
};

const blank = {
  nome: "",
  categoria: "casa",
  loja: "",
  link: "",
  valor: 0,
  prioridade: "media",
  status: "disponivel",
  quem_presenteou: "",
};

const num = (s: string) => {
  const n = parseFloat(s.replace(",", "."));
  return isNaN(n) ? 0 : n;
};

export default function GiftsPage() {
  const { rows, loading, error, add, update, remove } = useList<Row>("presentes");
  const config = useSingle<{ pix_key: string }>("presentes_config");

  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(blank);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState(blank);
  const [pix, setPix] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (config.row?.pix_key != null) setPix(config.row.pix_key);
  }, [config.row]);

  const total = rows.reduce((a, g) => a + (g.valor ?? 0), 0);
  const received = rows
    .filter((g) => g.status === "ganho")
    .reduce((a, g) => a + (g.valor ?? 0), 0);

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setMsg(`${label} copiado!`);
    } catch {
      setMsg("Não foi possível copiar.");
    }
    setTimeout(() => setMsg(""), 2500);
  }
  function shareList() {
    const available = rows.filter((g) => g.status === "disponivel");
    const lines = [
      "Nossa lista de presentes",
      "",
      ...available.map(
        (g) =>
          `• ${g.nome ?? ""}${g.valor ? `: ${formatCurrency(g.valor)}` : ""}${
            g.link ? `\n  ${g.link}` : ""
          }`,
      ),
    ];
    if (pix.trim()) lines.push("", `Se preferir, nosso Pix: ${pix}`);
    copy(lines.join("\n"), "Lista");
  }

  const fields = (d: typeof blank, setD: (v: typeof blank) => void) => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="Nome do presente">
        <Input value={d.nome} onChange={(e) => setD({ ...d, nome: e.target.value })} required />
      </Field>
      <Field label="Categoria">
        <Select value={d.categoria} onChange={(e) => setD({ ...d, categoria: e.target.value })}>
          {Object.entries(CATEGORY_LABEL).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </Select>
      </Field>
      <Field label="Loja / link">
        <Input value={d.link} onChange={(e) => setD({ ...d, link: e.target.value })} placeholder="https://..." />
      </Field>
      <Field label="Valor estimado (R$)">
        <Input type="number" min="0" step="0.01" value={d.valor || ""} onChange={(e) => setD({ ...d, valor: num(e.target.value) })} />
      </Field>
      <Field label="Prioridade">
        <Select value={d.prioridade} onChange={(e) => setD({ ...d, prioridade: e.target.value })}>
          {Object.entries(PRIORITY_LABEL).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </Select>
      </Field>
      <Field label="Status">
        <Select value={d.status} onChange={(e) => setD({ ...d, status: e.target.value })}>
          {Object.entries(STATUS_LABEL).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </Select>
      </Field>
      <Field label="Quem presenteou (opcional)">
        <Input value={d.quem_presenteou} onChange={(e) => setD({ ...d, quem_presenteou: e.target.value })} />
      </Field>
    </div>
  );

  return (
    <div>
      <PageHeader title="Presentes" subtitle="Lista de presentes, Pix e link para compartilhar." />
      {error && <Card className="mb-4 text-sm text-rose-700">Erro: {error}</Card>}

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Card className="!p-4">
          <p className="text-xs text-[#8a7b63]">Valor total da lista</p>
          <p className="text-2xl font-semibold text-[#2B2620]">{formatCurrency(total)}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-[#8a7b63]">Já recebido (presentes ganhos)</p>
          <p className="text-2xl font-semibold text-emerald-700">{formatCurrency(received)}</p>
        </Card>
      </div>

      <Card className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Field label="Chave Pix">
              <Input
                value={pix}
                onChange={(e) => setPix(e.target.value)}
                onBlur={() => config.save({ pix_key: pix })}
                placeholder="e-mail, telefone, CPF ou chave aleatória"
              />
            </Field>
          </div>
          <Button variant="ghost" onClick={() => copy(pix, "Chave Pix")} disabled={!pix.trim()}>
            <Copy size={15} /> Copiar chave
          </Button>
          <Button onClick={shareList}>
            <Share2 size={15} /> Gerar lista
          </Button>
        </div>
        {msg && <p className="mt-3 text-sm font-medium text-emerald-700">{msg}</p>}
      </Card>

      <div className="mb-6">
        {adding ? (
          <Card>
            <div className="flex flex-col gap-4">
              {fields(draft, setDraft)}
              <div className="flex items-center gap-3">
                <Button
                  onClick={async () => {
                    if (!draft.nome.trim()) return;
                    await add(draft as Partial<Row>);
                    setDraft(blank);
                    setAdding(false);
                  }}
                >
                  Adicionar presente
                </Button>
                <Button variant="ghost" onClick={() => setAdding(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Button onClick={() => setAdding(true)}>
            <Plus size={16} /> Adicionar presente
          </Button>
        )}
      </div>

      {loading ? (
        <p className="text-[#8a7b63]">Carregando...</p>
      ) : rows.length === 0 ? (
        <Card className="text-center text-[#8a7b63]">Nenhum presente na lista ainda.</Card>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((g) =>
            editingId === g.id ? (
              <Card key={g.id}>
                <div className="flex flex-col gap-4">
                  {fields(editDraft, setEditDraft)}
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={async () => {
                        await update(g.id, editDraft as Partial<Row>);
                        setEditingId(null);
                      }}
                    >
                      Salvar
                    </Button>
                    <Button variant="ghost" onClick={() => setEditingId(null)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card key={g.id}>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-[#2B2620]">{g.nome}</h3>
                  <Badge tone={STATUS_TONE[g.status ?? "disponivel"] ?? "stone"}>
                    {STATUS_LABEL[g.status ?? "disponivel"]}
                  </Badge>
                  <Badge tone={PRIORITY_TONE[g.prioridade ?? "media"] ?? "stone"}>
                    Prioridade {PRIORITY_LABEL[g.prioridade ?? "media"]}
                  </Badge>
                  <span className="ml-auto font-semibold text-[#2B2620]">
                    {formatCurrency(g.valor)}
                  </span>
                </div>
                <p className="text-sm text-[#8a7b63]">
                  {[CATEGORY_LABEL[g.categoria ?? "outro"], g.quem_presenteou && `Por: ${g.quem_presenteou}`]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <div className="mt-4 flex items-center gap-4 border-t border-[rgba(180,144,84,0.18)] pt-3">
                  {g.link && g.link.trim() !== "" && (
                    <a
                      href={g.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-[#9C6C3C] hover:text-[#2B2620]"
                    >
                      <ExternalLink size={15} /> Abrir loja
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(g.id);
                      setEditDraft({
                        nome: g.nome ?? "",
                        categoria: g.categoria ?? "casa",
                        loja: g.loja ?? "",
                        link: g.link ?? "",
                        valor: g.valor ?? 0,
                        prioridade: g.prioridade ?? "media",
                        status: g.status ?? "disponivel",
                        quem_presenteou: g.quem_presenteou ?? "",
                      });
                    }}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[#9C6C3C] hover:text-[#2B2620]"
                  >
                    <Pencil size={15} /> Editar
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm("Excluir este presente?")) await remove(g.id);
                    }}
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
