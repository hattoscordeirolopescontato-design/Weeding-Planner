"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, ExternalLink, Check, Plane, Hotel, MapPin } from "lucide-react";
import { Card, PageHeader, Button, Field, Input, Select, Textarea } from "@/components/ui";
import { Attachments } from "@/components/file-attachments";
import { uid } from "@/lib/use-local-store";
import { useSingle } from "@/lib/supabase/hooks";
import { formatCurrency } from "@/lib/format";
import type {
  Honeymoon,
  HoneymoonLodging,
  HoneymoonFlight,
  HoneymoonDay,
  HoneymoonTask,
  Receipt,
} from "@/lib/types";

const HM_TASKS = [
  "Passaporte válido",
  "Visto (se necessário)",
  "Seguro viagem contratado",
  "Reservas de hospedagem confirmadas",
  "Passagens emitidas",
  "Mala feita",
  "Documentos impressos (reservas e passagens)",
  "Câmera e carregadores",
  "Adaptador de tomada",
  "Moeda local / cartão internacional",
  "Remédios pessoais",
  "Check-in online feito",
];

function defaultHoneymoon(): Honeymoon {
  return {
    destination: "",
    altDestination: "",
    departDate: "",
    returnDate: "",
    budget: 0,
    lodging: [],
    flights: [],
    itinerary: [],
    checklist: HM_TASKS.map((t, i) => ({
      id: `hm-${i}`,
      title: t,
      done: false,
      custom: false,
    })),
  };
}

const num = (s: string) => {
  const n = parseFloat(s.replace(",", "."));
  return isNaN(n) ? 0 : n;
};

export default function HoneymoonPage() {
  const single = useSingle<Record<string, unknown>>("lua_de_mel");
  const loaded = !single.loading;
  const [hm, setHm] = useState<Honeymoon>(defaultHoneymoon());
  const [taskTitle, setTaskTitle] = useState("");
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    const r = single.row;
    if (!r) return;
    setHm({
      destination: (r.destino as string) ?? "",
      altDestination: (r.destino_alternativo as string) ?? "",
      departDate: (r.data_ida as string) ?? "",
      returnDate: (r.data_volta as string) ?? "",
      budget: (r.orcamento as number) ?? 0,
      lodging: (r.hospedagem as Honeymoon["lodging"]) ?? [],
      flights: (r.passagens as Honeymoon["flights"]) ?? [],
      itinerary: (r.roteiro as Honeymoon["itinerary"]) ?? [],
      checklist:
        (r.checklist as Honeymoon["checklist"]) ?? defaultHoneymoon().checklist,
    });
  }, [single.row]);

  const patch = (p: Partial<Honeymoon>) => {
    setHm((h) => ({ ...h, ...p }));
    setSaved(false);
  };

  async function salvar() {
    await single.save({
      destino: hm.destination,
      destino_alternativo: hm.altDestination,
      data_ida: hm.departDate || null,
      data_volta: hm.returnDate || null,
      orcamento: hm.budget,
      hospedagem: hm.lodging,
      passagens: hm.flights,
      roteiro: hm.itinerary,
      checklist: hm.checklist,
    });
    setSaved(true);
  }

  // Hospedagem
  const addLodging = () =>
    patch({
      lodging: [
        ...hm.lodging,
        { id: uid(), name: "", bookingUrl: "", price: 0, status: "pendente", receipts: [] },
      ],
    });
  const updLodging = (id: string, p: Partial<HoneymoonLodging>) =>
    patch({ lodging: hm.lodging.map((l) => (l.id === id ? { ...l, ...p } : l)) });
  const delLodging = (id: string) =>
    patch({ lodging: hm.lodging.filter((l) => l.id !== id) });

  // Passagens
  const addFlight = () =>
    patch({
      flights: [
        ...hm.flights,
        { id: uid(), airline: "", flightNumber: "", price: 0, receipts: [] },
      ],
    });
  const updFlight = (id: string, p: Partial<HoneymoonFlight>) =>
    patch({ flights: hm.flights.map((f) => (f.id === id ? { ...f, ...p } : f)) });
  const delFlight = (id: string) =>
    patch({ flights: hm.flights.filter((f) => f.id !== id) });

  // Roteiro
  const addDay = () =>
    patch({
      itinerary: [...hm.itinerary, { id: uid(), title: "", activities: "" }],
    });
  const updDay = (id: string, p: Partial<HoneymoonDay>) =>
    patch({ itinerary: hm.itinerary.map((d) => (d.id === id ? { ...d, ...p } : d)) });
  const delDay = (id: string) =>
    patch({ itinerary: hm.itinerary.filter((d) => d.id !== id) });

  // Checklist
  const toggleTask = (id: string) =>
    patch({
      checklist: hm.checklist.map((t) =>
        t.id === id ? { ...t, done: !t.done } : t,
      ),
    });
  const delTask = (id: string) => {
    if (!window.confirm("Excluir este item?")) return;
    patch({ checklist: hm.checklist.filter((t) => t.id !== id) });
  };
  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    patch({
      checklist: [
        ...hm.checklist,
        { id: uid(), title: taskTitle.trim(), done: false, custom: true },
      ],
    });
    setTaskTitle("");
  };

  const spent =
    hm.lodging.reduce((a, l) => a + l.price, 0) +
    hm.flights.reduce((a, f) => a + f.price, 0);
  const taskDone = hm.checklist.filter((t) => t.done).length;
  const taskPct =
    hm.checklist.length === 0
      ? 0
      : Math.round((taskDone / hm.checklist.length) * 100);

  if (!loaded) {
    return (
      <div>
        <PageHeader title="Lua de Mel" />
        <p className="text-[#8a7b63]">Carregando...</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Lua de Mel"
        subtitle="Destino, datas, orçamento, hospedagem, passagens e roteiro."
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

      {/* Destino e datas */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Destino principal">
            <Input
              value={hm.destination}
              onChange={(e) => patch({ destination: e.target.value })}
              placeholder="Ex.: Maldivas"
            />
          </Field>
          <Field label="Destino alternativo">
            <Input
              value={hm.altDestination}
              onChange={(e) => patch({ altDestination: e.target.value })}
            />
          </Field>
          <Field label="Ida">
            <Input
              type="date"
              value={hm.departDate}
              onChange={(e) => patch({ departDate: e.target.value })}
            />
          </Field>
          <Field label="Volta">
            <Input
              type="date"
              value={hm.returnDate}
              onChange={(e) => patch({ returnDate: e.target.value })}
            />
          </Field>
          <Field label="Orçamento da lua de mel (R$)" hint="Separado do orçamento do casamento">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={hm.budget || ""}
              onChange={(e) => patch({ budget: num(e.target.value) })}
            />
          </Field>
        </div>
        {hm.budget > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-[#6B5F4F]">
              <span>Gasto</span>
              <span>
                {formatCurrency(spent)} de {formatCurrency(hm.budget)}
              </span>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[rgba(156,108,60,0.08)]">
              <div
                className="h-full rounded-full bg-bege"
                style={{
                  width: `${Math.min(100, (spent / hm.budget) * 100).toFixed(1)}%`,
                }}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Hospedagem */}
      <Section
        title="Hospedagem"
        icon={<Hotel size={18} className="text-[#9C6C3C]" />}
        onAdd={addLodging}
        addLabel="Adicionar hospedagem"
      >
        {hm.lodging.length === 0 ? (
          <Empty text="Nenhuma hospedagem ainda." />
        ) : (
          hm.lodging.map((l) => (
            <Card key={l.id}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Nome do hotel">
                  <Input
                    value={l.name}
                    onChange={(e) => updLodging(l.id, { name: e.target.value })}
                  />
                </Field>
                <Field label="Link da reserva">
                  <Input
                    value={l.bookingUrl}
                    onChange={(e) => updLodging(l.id, { bookingUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </Field>
                <Field label="Valor (R$)">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={l.price || ""}
                    onChange={(e) => updLodging(l.id, { price: num(e.target.value) })}
                  />
                </Field>
                <Field label="Status">
                  <Select
                    value={l.status}
                    onChange={(e) =>
                      updLodging(l.id, {
                        status: e.target.value as HoneymoonLodging["status"],
                      })
                    }
                  >
                    <option value="pendente">Pendente</option>
                    <option value="confirmado">Confirmado</option>
                  </Select>
                </Field>
              </div>
              <div className="mt-4">
                <Attachments
                  receipts={l.receipts}
                  onAdd={(r: Receipt) =>
                    updLodging(l.id, { receipts: [...l.receipts, r] })
                  }
                  onRemove={(rid) =>
                    updLodging(l.id, {
                      receipts: l.receipts.filter((x) => x.id !== rid),
                    })
                  }
                />
              </div>
              <RowActions url={l.bookingUrl} urlLabel="Abrir reserva" onDelete={() => delLodging(l.id)} />
            </Card>
          ))
        )}
      </Section>

      {/* Passagens */}
      <Section
        title="Passagens"
        icon={<Plane size={18} className="text-[#9C6C3C]" />}
        onAdd={addFlight}
        addLabel="Adicionar passagem"
      >
        {hm.flights.length === 0 ? (
          <Empty text="Nenhuma passagem ainda." />
        ) : (
          hm.flights.map((f) => (
            <Card key={f.id}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Companhia aérea">
                  <Input
                    value={f.airline}
                    onChange={(e) => updFlight(f.id, { airline: e.target.value })}
                  />
                </Field>
                <Field label="Nº do voo">
                  <Input
                    value={f.flightNumber}
                    onChange={(e) => updFlight(f.id, { flightNumber: e.target.value })}
                  />
                </Field>
                <Field label="Valor (R$)">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={f.price || ""}
                    onChange={(e) => updFlight(f.id, { price: num(e.target.value) })}
                  />
                </Field>
              </div>
              <div className="mt-4">
                <Attachments
                  label="Bilhete"
                  receipts={f.receipts}
                  onAdd={(r: Receipt) => updFlight(f.id, { receipts: [...f.receipts, r] })}
                  onRemove={(rid) =>
                    updFlight(f.id, {
                      receipts: f.receipts.filter((x) => x.id !== rid),
                    })
                  }
                />
              </div>
              <RowActions onDelete={() => delFlight(f.id)} />
            </Card>
          ))
        )}
      </Section>

      {/* Roteiro */}
      <Section
        title="Roteiro"
        icon={<MapPin size={18} className="text-[#9C6C3C]" />}
        onAdd={addDay}
        addLabel="Adicionar dia"
      >
        {hm.itinerary.length === 0 ? (
          <Empty text="Nenhum dia planejado ainda." />
        ) : (
          hm.itinerary.map((d, idx) => (
            <Card key={d.id}>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-[#9C6C3C]">Dia {idx + 1}</span>
                <button
                  type="button"
                  onClick={() => delDay(d.id)}
                  className="text-[#b7a98c] hover:text-rose-600"
                  aria-label="Remover dia"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="mt-3 flex flex-col gap-3">
                <Field label="Título">
                  <Input
                    value={d.title}
                    onChange={(e) => updDay(d.id, { title: e.target.value })}
                    placeholder="Ex.: Chegada e passeio pela cidade"
                  />
                </Field>
                <Field label="Atividades planejadas">
                  <Textarea
                    value={d.activities}
                    onChange={(e) => updDay(d.id, { activities: e.target.value })}
                  />
                </Field>
              </div>
            </Card>
          ))
        )}
      </Section>

      {/* Checklist da lua de mel */}
      <div className="mb-2 mt-8 flex items-center gap-2">
        <Check size={18} className="text-[#9C6C3C]" />
        <h2 className="font-display text-xl font-semibold text-[#9C6C3C]">
          Checklist da viagem
        </h2>
        <span className="text-sm text-[#b7a98c]">
          ({taskDone}/{hm.checklist.length} · {taskPct}%)
        </span>
      </div>
      <Card>
        <form onSubmit={addTask} className="mb-3 flex gap-2">
          <Input
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="Adicionar item..."
          />
          <Button type="submit">
            <Plus size={16} />
          </Button>
        </form>
        <ul className="flex flex-col">
          {hm.checklist.map((t) => (
            <li
              key={t.id}
              className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-[rgba(156,108,60,0.05)]"
            >
              <button
                type="button"
                onClick={() => toggleTask(t.id)}
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                  t.done
                    ? "border-[#9C6C3C] bg-[#9C6C3C] text-white"
                    : "border-[rgba(180,144,84,0.4)] bg-[rgba(156,108,60,0.05)]"
                }`}
                aria-label={t.done ? "Desmarcar" : "Marcar"}
              >
                {t.done && <Check size={14} strokeWidth={3} />}
              </button>
              <span
                className={`flex-1 text-sm ${
                  t.done ? "text-[#b7a98c] line-through" : "text-[#2B2620]"
                }`}
              >
                {t.title}
              </span>
              <button
                type="button"
                onClick={() => delTask(t.id)}
                className="text-[#b7a98c] hover:text-rose-600"
                aria-label="Remover item"
              >
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function Section({
  title,
  icon,
  onAdd,
  addLabel,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  onAdd: () => void;
  addLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display flex items-center gap-2 text-xl font-semibold text-[#9C6C3C]">
          {icon}
          {title}
        </h2>
        <Button variant="ghost" onClick={onAdd}>
          <Plus size={15} /> {addLabel}
        </Button>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <Card className="text-center text-[#8a7b63]">{text}</Card>;
}

function RowActions({
  url,
  urlLabel,
  onDelete,
}: {
  url?: string;
  urlLabel?: string;
  onDelete: () => void;
}) {
  return (
    <div className="mt-4 flex items-center gap-4 border-t border-[rgba(180,144,84,0.18)] pt-3">
      {url && url.trim() !== "" && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#9C6C3C] hover:text-[#2B2620]"
        >
          <ExternalLink size={15} /> {urlLabel}
        </a>
      )}
      <button
        type="button"
        onClick={onDelete}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#8a7b63] hover:text-rose-600"
      >
        <Trash2 size={15} /> Excluir
      </button>
    </div>
  );
}
