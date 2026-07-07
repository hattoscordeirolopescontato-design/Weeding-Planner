"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown, Music } from "lucide-react";
import { Card, PageHeader, Button, Field, Input, Select, Textarea } from "@/components/ui";
import { uid } from "@/lib/use-local-store";
import { useSingle } from "@/lib/supabase/hooks";
import type {
  Ceremony,
  CeremonyType,
  CeremonyStep,
  CeremonyMusic,
  CeremonyMusicMoment,
} from "@/lib/types";

const TYPES: { value: CeremonyType; label: string }[] = [
  { value: "religiosa", label: "Religiosa" },
  { value: "civil", label: "Civil" },
  { value: "simbolica", label: "Simbólica" },
  { value: "mista", label: "Mista" },
];

const DEFAULT_STEPS = [
  "Abertura",
  "Entrada dos padrinhos",
  "Entrada da noiva",
  "Cerimônia",
  "Troca de alianças",
  "Votos",
  "Pronunciamento",
  "Saída dos noivos",
];

const MOMENTS: CeremonyMusicMoment[] = [
  "Entrada dos padrinhos",
  "Entrada da noiva",
  "Durante a cerimônia",
  "Saída",
];

function defaultCeremony(): Ceremony {
  return {
    type: "",
    celebrant: "",
    celebrantContact: "",
    duration: "",
    steps: DEFAULT_STEPS.map((d, i) => ({
      id: `step-${i}`,
      description: d,
      time: "",
      note: "",
    })),
    music: [],
    notes: "",
  };
}

export default function CeremonyPage() {
  const single = useSingle<Record<string, unknown>>("cerimonia");
  const loaded = !single.loading;
  const [c, setC] = useState<Ceremony>(defaultCeremony());
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    const r = single.row;
    if (!r) return;
    setC({
      type: (r.tipo as Ceremony["type"]) ?? "",
      celebrant: (r.celebrante as string) ?? "",
      celebrantContact: (r.contato_celebrante as string) ?? "",
      duration: (r.duracao as string) ?? "",
      steps: (r.roteiro as Ceremony["steps"]) ?? defaultCeremony().steps,
      music: (r.musicas as Ceremony["music"]) ?? [],
      notes: (r.observacoes as string) ?? "",
    });
  }, [single.row]);

  const patch = (p: Partial<Ceremony>) => {
    setC((cur) => ({ ...cur, ...p }));
    setSaved(false);
  };

  async function salvar() {
    await single.save({
      tipo: c.type || null,
      celebrante: c.celebrant,
      contato_celebrante: c.celebrantContact,
      duracao: c.duration,
      roteiro: c.steps,
      musicas: c.music,
      observacoes: c.notes,
    });
    setSaved(true);
  }

  const updStep = (id: string, p: Partial<CeremonyStep>) =>
    patch({ steps: c.steps.map((s) => (s.id === id ? { ...s, ...p } : s)) });
  const addStep = () =>
    patch({ steps: [...c.steps, { id: uid(), description: "", time: "", note: "" }] });
  const delStep = (id: string) =>
    patch({ steps: c.steps.filter((s) => s.id !== id) });
  const moveStep = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= c.steps.length) return;
    const steps = [...c.steps];
    [steps[index], steps[next]] = [steps[next], steps[index]];
    patch({ steps });
  };

  const addMusic = () =>
    patch({
      music: [
        ...c.music,
        { id: uid(), moment: MOMENTS[0], title: "", artist: "", link: "" },
      ],
    });
  const updMusic = (id: string, p: Partial<CeremonyMusic>) =>
    patch({ music: c.music.map((m) => (m.id === id ? { ...m, ...p } : m)) });
  const delMusic = (id: string) =>
    patch({ music: c.music.filter((m) => m.id !== id) });

  if (!loaded) {
    return (
      <div>
        <PageHeader title="Cerimônia" />
        <p className="text-[#8a7b63]">Carregando...</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Cerimônia"
        subtitle="Tipo, celebrante, roteiro e músicas de cada momento."
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

      {/* Dados gerais */}
      <Card className="mb-6">
        <p className="mb-2 text-sm font-medium text-[#2B2620]">Tipo de cerimônia</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {TYPES.map((t) => {
            const active = c.type === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => patch({ type: t.value })}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "border-[#9C6C3C] bg-[rgba(156,108,60,0.14)] text-[#2B2620]"
                    : "border-[rgba(180,144,84,0.3)] bg-[rgba(156,108,60,0.05)] text-[#6B5F4F] hover:bg-[rgba(156,108,60,0.1)]"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Celebrante / padre / pastor">
            <Input
              value={c.celebrant}
              onChange={(e) => patch({ celebrant: e.target.value })}
            />
          </Field>
          <Field label="Contato do celebrante">
            <Input
              value={c.celebrantContact}
              onChange={(e) => patch({ celebrantContact: e.target.value })}
            />
          </Field>
          <Field label="Duração estimada">
            <Input
              value={c.duration}
              onChange={(e) => patch({ duration: e.target.value })}
              placeholder="Ex.: 45 minutos"
            />
          </Field>
        </div>
      </Card>

      {/* Roteiro */}
      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-[#9C6C3C]">
            Roteiro da cerimônia
          </h2>
          <Button variant="ghost" onClick={addStep}>
            <Plus size={15} /> Etapa
          </Button>
        </div>
        <div className="flex flex-col gap-3">
          {c.steps.map((s, i) => (
            <Card key={s.id}>
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-1 pt-1">
                  <button
                    type="button"
                    onClick={() => moveStep(i, -1)}
                    disabled={i === 0}
                    className="text-[#8a7b63] hover:text-[#2B2620] disabled:opacity-30"
                    aria-label="Subir"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <span className="text-xs font-semibold text-[#9C6C3C]">{i + 1}</span>
                  <button
                    type="button"
                    onClick={() => moveStep(i, 1)}
                    disabled={i === c.steps.length - 1}
                    className="text-[#8a7b63] hover:text-[#2B2620] disabled:opacity-30"
                    aria-label="Descer"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
                <div className="flex-1">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                    <div className="sm:col-span-7">
                      <Field label="Descrição">
                        <Input
                          value={s.description}
                          onChange={(e) =>
                            updStep(s.id, { description: e.target.value })
                          }
                        />
                      </Field>
                    </div>
                    <div className="sm:col-span-2">
                      <Field label="Horário">
                        <Input
                          type="time"
                          value={s.time}
                          onChange={(e) => updStep(s.id, { time: e.target.value })}
                        />
                      </Field>
                    </div>
                    <div className="sm:col-span-3">
                      <Field label="Observação">
                        <Input
                          value={s.note}
                          onChange={(e) => updStep(s.id, { note: e.target.value })}
                        />
                      </Field>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => delStep(s.id)}
                  className="pt-7 text-[#b7a98c] hover:text-rose-600"
                  aria-label="Remover etapa"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Músicas */}
      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display flex items-center gap-2 text-xl font-semibold text-[#9C6C3C]">
            <Music size={18} /> Músicas
          </h2>
          <Button variant="ghost" onClick={addMusic}>
            <Plus size={15} /> Música
          </Button>
        </div>
        {c.music.length === 0 ? (
          <Card className="text-center text-[#8a7b63]">
            Nenhuma música adicionada ainda.
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {c.music.map((m) => (
              <Card key={m.id}>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                  <div className="sm:col-span-3">
                    <Field label="Momento">
                      <Select
                        value={m.moment}
                        onChange={(e) =>
                          updMusic(m.id, {
                            moment: e.target.value as CeremonyMusicMoment,
                          })
                        }
                      >
                        {MOMENTS.map((mo) => (
                          <option key={mo} value={mo}>
                            {mo}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  </div>
                  <div className="sm:col-span-3">
                    <Field label="Título">
                      <Input
                        value={m.title}
                        onChange={(e) => updMusic(m.id, { title: e.target.value })}
                      />
                    </Field>
                  </div>
                  <div className="sm:col-span-3">
                    <Field label="Artista">
                      <Input
                        value={m.artist}
                        onChange={(e) => updMusic(m.id, { artist: e.target.value })}
                      />
                    </Field>
                  </div>
                  <div className="sm:col-span-3">
                    <Field label="Link (opcional)">
                      <Input
                        value={m.link}
                        onChange={(e) => updMusic(m.id, { link: e.target.value })}
                        placeholder="Spotify / YouTube"
                      />
                    </Field>
                  </div>
                </div>
                <div className="mt-3 border-t border-[rgba(180,144,84,0.18)] pt-3">
                  <button
                    type="button"
                    onClick={() => delMusic(m.id)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[#8a7b63] hover:text-rose-600"
                  >
                    <Trash2 size={15} /> Remover música
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Card>
        <Field label="Observações gerais da cerimônia">
          <Textarea value={c.notes} onChange={(e) => patch({ notes: e.target.value })} />
        </Field>
      </Card>
    </div>
  );
}
