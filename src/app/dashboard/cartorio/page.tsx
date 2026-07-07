"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Info } from "lucide-react";
import { Card, PageHeader, Button, Field, Input, Select, Textarea, Badge } from "@/components/ui";
import { Attachments } from "@/components/file-attachments";
import { uid } from "@/lib/use-local-store";
import { useSingle } from "@/lib/supabase/hooks";
import type {
  Cartorio,
  CartorioDoc,
  DocPerson,
  DocStatus,
  Witness,
  Receipt,
} from "@/lib/types";

const PERSON_DOCS: Record<"noivo" | "noiva", string[]> = {
  noivo: [
    "RG ou CNH",
    "CPF",
    "Certidão de nascimento original",
    "Comprovante de residência",
    "Certidão de casamento anterior + divórcio (se aplicável)",
  ],
  noiva: [
    "RG ou CNH",
    "CPF",
    "Certidão de nascimento original",
    "Comprovante de residência",
    "Certidão de casamento anterior + divórcio (se aplicável)",
  ],
};

const STATUS_LABEL: Record<DocStatus, string> = {
  pendente: "Pendente",
  separado: "Separado",
  entregue: "Entregue ao cartório",
};
const STATUS_TONE: Record<DocStatus, "amber" | "blue" | "green"> = {
  pendente: "amber",
  separado: "blue",
  entregue: "green",
};
const PERSON_LABEL: Record<DocPerson, string> = {
  noivo: "Noivo",
  noiva: "Noiva",
  casal: "Casal",
};

function defaultCartorio(): Cartorio {
  const docs: CartorioDoc[] = [];
  (["noivo", "noiva"] as const).forEach((person) => {
    PERSON_DOCS[person].forEach((label, i) => {
      docs.push({
        id: `doc-${person}-${i}`,
        person,
        label,
        status: "pendente",
        receipts: [],
      });
    });
  });
  return {
    name: "",
    address: "",
    contact: "",
    habilitacaoDate: "",
    cerimoniaDate: "",
    docs,
    witnesses: [
      { id: uid(), name: "", rg: "" },
      { id: uid(), name: "", rg: "" },
    ],
    pacto: false,
    notes: "",
  };
}

export default function CartorioPage() {
  const single = useSingle<Record<string, unknown>>("cartorio");
  const loaded = !single.loading;
  const [c, setC] = useState<Cartorio>(defaultCartorio());
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    const r = single.row;
    if (!r) return;
    const def = defaultCartorio();
    setC({
      name: (r.nome as string) ?? "",
      address: (r.endereco as string) ?? "",
      contact: (r.contato as string) ?? "",
      habilitacaoDate: (r.data_habilitacao as string) ?? "",
      cerimoniaDate: (r.data_cerimonia_civil as string) ?? "",
      docs: (r.documentos as Cartorio["docs"]) ?? def.docs,
      witnesses: (r.testemunhas as Cartorio["witnesses"]) ?? def.witnesses,
      pacto: (r.pacto as boolean) ?? false,
      notes: (r.observacoes as string) ?? "",
    });
  }, [single.row]);

  const patch = (p: Partial<Cartorio>) => {
    setC((cur) => ({ ...cur, ...p }));
    setSaved(false);
  };

  async function salvar() {
    await single.save({
      nome: c.name,
      endereco: c.address,
      contato: c.contact,
      data_habilitacao: c.habilitacaoDate || null,
      data_cerimonia_civil: c.cerimoniaDate || null,
      documentos: c.docs,
      testemunhas: c.witnesses,
      pacto: c.pacto,
      observacoes: c.notes,
    });
    setSaved(true);
  }

  const updDoc = (id: string, p: Partial<CartorioDoc>) =>
    patch({ docs: c.docs.map((d) => (d.id === id ? { ...d, ...p } : d)) });
  const addDoc = (person: DocPerson) =>
    patch({
      docs: [
        ...c.docs,
        { id: uid(), person, label: "", status: "pendente", receipts: [] },
      ],
    });
  const delDoc = (id: string) =>
    patch({ docs: c.docs.filter((d) => d.id !== id) });

  const addWitness = () =>
    patch({ witnesses: [...c.witnesses, { id: uid(), name: "", rg: "" }] });
  const updWitness = (id: string, p: Partial<Witness>) =>
    patch({ witnesses: c.witnesses.map((w) => (w.id === id ? { ...w, ...p } : w)) });
  const delWitness = (id: string) =>
    patch({ witnesses: c.witnesses.filter((w) => w.id !== id) });

  if (!loaded) {
    return (
      <div>
        <PageHeader title="Cartório" />
        <p className="text-[#8a7b63]">Carregando...</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Cartório"
        subtitle="Organize os documentos da habilitação e da cerimônia civil."
      />

      <div className="sticky top-2 z-10 mb-6 flex items-center gap-3">
        <Button onClick={salvar}>{saved ? "Salvo" : "Salvar alterações"}</Button>
        {!saved && (
          <span className="text-sm text-amber-700">Há alterações não salvas</span>
        )}
        {single.error && (
          <span className="text-sm text-rose-700">{single.error}</span>
        )}
      </div>

      <div className="mb-6 flex items-start gap-2 rounded-xl border border-[rgba(180,144,84,0.25)] bg-[rgba(156,108,60,0.05)] p-3 text-sm text-[#6B5F4F]">
        <Info size={16} className="mt-0.5 shrink-0 text-[#9C6C3C]" />
        <span>
          Esta seção é <strong>opcional</strong> e serve apenas para organização.
          Os documentos exigidos podem variar conforme o cartório — confirme
          sempre com o seu.
        </span>
      </div>

      {/* Dados do cartório */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nome do cartório">
            <Input value={c.name} onChange={(e) => patch({ name: e.target.value })} />
          </Field>
          <Field label="Contato (telefone / e-mail)">
            <Input value={c.contact} onChange={(e) => patch({ contact: e.target.value })} />
          </Field>
          <Field label="Endereço">
            <Input value={c.address} onChange={(e) => patch({ address: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Data da habilitação">
              <Input
                type="date"
                value={c.habilitacaoDate}
                onChange={(e) => patch({ habilitacaoDate: e.target.value })}
              />
            </Field>
            <Field label="Cerimônia civil">
              <Input
                type="date"
                value={c.cerimoniaDate}
                onChange={(e) => patch({ cerimoniaDate: e.target.value })}
              />
            </Field>
          </div>
        </div>
      </Card>

      {/* Documentos por pessoa */}
      {(["noivo", "noiva"] as const).map((person) => {
        const docs = c.docs.filter((d) => d.person === person);
        return (
          <section key={person} className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-[#9C6C3C]">
                Documentos — {PERSON_LABEL[person]}
              </h2>
              <Button variant="ghost" onClick={() => addDoc(person)}>
                <Plus size={15} /> Documento
              </Button>
            </div>
            <div className="flex flex-col gap-3">
              {docs.map((d) => (
                <Card key={d.id}>
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div className="min-w-[200px] flex-1">
                      <Field label="Documento">
                        <Input
                          value={d.label}
                          onChange={(e) => updDoc(d.id, { label: e.target.value })}
                        />
                      </Field>
                    </div>
                    <div className="w-52">
                      <Field label="Status">
                        <Select
                          value={d.status}
                          onChange={(e) =>
                            updDoc(d.id, { status: e.target.value as DocStatus })
                          }
                        >
                          {Object.entries(STATUS_LABEL).map(([v, l]) => (
                            <option key={v} value={v}>
                              {l}
                            </option>
                          ))}
                        </Select>
                      </Field>
                    </div>
                    <Badge tone={STATUS_TONE[d.status]}>{STATUS_LABEL[d.status]}</Badge>
                  </div>
                  <div className="mt-4">
                    <Attachments
                      receipts={d.receipts}
                      onAdd={(r: Receipt) =>
                        updDoc(d.id, { receipts: [...d.receipts, r] })
                      }
                      onRemove={(rid) =>
                        updDoc(d.id, {
                          receipts: d.receipts.filter((x) => x.id !== rid),
                        })
                      }
                    />
                  </div>
                  <div className="mt-4 border-t border-[rgba(180,144,84,0.18)] pt-3">
                    <button
                      type="button"
                      onClick={() => delDoc(d.id)}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-[#8a7b63] hover:text-rose-600"
                    >
                      <Trash2 size={15} /> Remover documento
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        );
      })}

      {/* Casal */}
      <section className="mb-6">
        <h2 className="font-display mb-3 text-xl font-semibold text-[#9C6C3C]">Casal</h2>
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-[#2B2620]">Testemunhas</p>
            <button
              type="button"
              onClick={addWitness}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#9C6C3C] hover:text-[#2B2620]"
            >
              <Plus size={15} /> Testemunha
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {c.witnesses.map((w, i) => (
              <div key={w.id} className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                <div className="sm:col-span-6">
                  <Field label={`Testemunha ${i + 1} — Nome`}>
                    <Input
                      value={w.name}
                      onChange={(e) => updWitness(w.id, { name: e.target.value })}
                    />
                  </Field>
                </div>
                <div className="sm:col-span-5">
                  <Field label="RG">
                    <Input
                      value={w.rg}
                      onChange={(e) => updWitness(w.id, { rg: e.target.value })}
                    />
                  </Field>
                </div>
                <div className="flex items-end sm:col-span-1">
                  <button
                    type="button"
                    onClick={() => delWitness(w.id)}
                    className="pb-2 text-[#b7a98c] hover:text-rose-600"
                    aria-label="Remover testemunha"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <label className="mt-4 flex items-center gap-2 text-sm font-medium text-[#2B2620]">
            <input
              type="checkbox"
              checked={c.pacto}
              onChange={(e) => patch({ pacto: e.target.checked })}
              className="h-4 w-4 rounded border-[rgba(180,144,84,0.35)] bg-[rgba(156,108,60,0.08)] accent-terracota"
            />
            Pacto antenupcial (se aplicável)
          </label>
        </Card>
      </section>

      <Card>
        <Field label="Observações">
          <Textarea value={c.notes} onChange={(e) => patch({ notes: e.target.value })} />
        </Field>
      </Card>
    </div>
  );
}
