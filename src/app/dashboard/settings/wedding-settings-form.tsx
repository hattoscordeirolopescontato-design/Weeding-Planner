"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Field, Input, Button } from "@/components/ui";

const num = (s: string) => {
  const n = parseFloat(s.replace(",", "."));
  return isNaN(n) ? 0 : n;
};

export function WeddingSettingsForm({
  userId,
  initial,
}: {
  userId: string;
  initial: { nomeNoivo: string; nomeNoiva: string; data: string; orcamento: number };
}) {
  const [f, setF] = useState(initial);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    setErr("");
    const sb = createClient();
    const { error } = await sb.from("profiles").upsert({
      id: userId,
      nome_noivo: f.nomeNoivo,
      nome_noiva: f.nomeNoiva,
      data_casamento: f.data || null,
      orcamento_total: f.orcamento || 0,
    });
    setSaving(false);
    if (error) setErr(error.message);
    else setMsg("Salvo!");
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nome do noivo">
          <Input value={f.nomeNoivo} onChange={(e) => setF({ ...f, nomeNoivo: e.target.value })} />
        </Field>
        <Field label="Nome da noiva">
          <Input value={f.nomeNoiva} onChange={(e) => setF({ ...f, nomeNoiva: e.target.value })} />
        </Field>
        <Field label="Data do casamento">
          <Input type="date" value={f.data} onChange={(e) => setF({ ...f, data: e.target.value })} />
        </Field>
        <Field label="Orçamento total (R$)">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={f.orcamento || ""}
            onChange={(e) => setF({ ...f, orcamento: num(e.target.value) })}
          />
        </Field>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Salvando..." : "Salvar"}
        </Button>
        {msg && <span className="text-xs font-medium text-emerald-700">{msg}</span>}
        {err && <span className="text-xs font-medium text-rose-700">{err}</span>}
      </div>
    </form>
  );
}
