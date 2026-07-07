"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Card, PageHeader, Button } from "@/components/ui";
import { useList } from "@/lib/supabase/hooks";
import type { Venue, VenueType, VenueService } from "@/lib/types";
import { VenueForm, type VenueInput } from "./venue-form";
import { VenueRow } from "./venue-row";

type Row = {
  id: string;
  tipo: string | null;
  nome: string | null;
  endereco: string | null;
  convidados_total: number | null;
  convidados_inteira: number | null;
  convidados_meia: number | null;
  convidados_nao_pagantes: number | null;
  valor_inteira: number | null;
  valor_meia: number | null;
  taxa_percentual: number | null;
  servicos_adicionais: VenueService[] | null;
  is_selected: boolean | null;
  observacoes: string | null;
};

function toVenue(r: Row): Venue {
  return {
    id: r.id,
    name: r.nome ?? "",
    type: (r.tipo ?? "") as VenueType | "",
    address: r.endereco ?? "",
    totalGuests: r.convidados_total ?? 0,
    fullGuests: r.convidados_inteira ?? 0,
    halfGuests: r.convidados_meia ?? 0,
    freeGuests: r.convidados_nao_pagantes ?? 0,
    pricePerFull: r.valor_inteira ?? 0,
    pricePerHalf: r.valor_meia ?? 0,
    taxPercent: r.taxa_percentual ?? 0,
    services: r.servicos_adicionais ?? [],
    notes: r.observacoes ?? "",
    isSelected: r.is_selected ?? false,
  };
}

function fromInput(v: VenueInput): Partial<Row> {
  return {
    tipo: v.type || null,
    nome: v.name,
    endereco: v.address,
    convidados_total: v.totalGuests,
    convidados_inteira: v.fullGuests,
    convidados_meia: v.halfGuests,
    convidados_nao_pagantes: v.freeGuests,
    valor_inteira: v.pricePerFull,
    valor_meia: v.pricePerHalf,
    taxa_percentual: v.taxPercent,
    servicos_adicionais: v.services,
    is_selected: v.isSelected,
    observacoes: v.notes,
  };
}

export default function VenuesPage() {
  const { rows, loading, error, add, update, remove } = useList<Row>("local");
  const [adding, setAdding] = useState(false);

  async function unselectOthers(exceptId: string) {
    for (const r of rows) {
      if (r.id !== exceptId && r.is_selected) {
        await update(r.id, { is_selected: false } as Partial<Row>);
      }
    }
  }

  return (
    <div>
      <PageHeader
        title="Local"
        subtitle="Compare opções, calcule o custo total e marque o local escolhido."
      />
      {error && <Card className="mb-4 text-sm text-rose-700">Erro: {error}</Card>}

      <div className="mb-6">
        {adding ? (
          <Card>
            <VenueForm
              onSubmit={async (data) => {
                const created = await add(fromInput(data));
                if (data.isSelected && created) await unselectOthers(created.id);
                setAdding(false);
              }}
              onCancel={() => setAdding(false)}
            />
          </Card>
        ) : (
          <Button onClick={() => setAdding(true)}>
            <Plus size={16} /> Adicionar local
          </Button>
        )}
      </div>

      {loading ? (
        <p className="text-[#8a7b63]">Carregando...</p>
      ) : rows.length === 0 ? (
        <Card className="text-center text-[#8a7b63]">
          Nenhum local cadastrado ainda.
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {[...rows]
            .sort((a, b) => Number(b.is_selected) - Number(a.is_selected))
            .map((r) => (
              <VenueRow
                key={r.id}
                venue={toVenue(r)}
                onUpdate={async (id, data) => {
                  await update(id, fromInput(data));
                  if (data.isSelected) await unselectOthers(id);
                }}
                onRemove={(id) => remove(id)}
              />
            ))}
        </div>
      )}
    </div>
  );
}
