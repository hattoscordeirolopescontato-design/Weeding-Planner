"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Card, PageHeader, Button } from "@/components/ui";
import { useList } from "@/lib/supabase/hooks";
import type { Vendor, Receipt } from "@/lib/types";
import { VendorForm, type VendorInput } from "./vendor-form";
import { VendorRow } from "./vendor-row";

type Row = {
  id: string;
  nome: string | null;
  categoria: string | null;
  contato: string | null;
  status: string | null;
  valor_total: number | null;
  parcelado: boolean | null;
  num_parcelas: number | null;
  valor_parcela: number | null;
  parcelas_pagas: number | null;
  observacoes: string | null;
  comprovantes: Receipt[] | null;
};

function toVendor(r: Row): Vendor {
  return {
    id: r.id,
    name: r.nome ?? "",
    category: r.categoria ?? "",
    contact: r.contato ?? "",
    status: (r.status ?? "cotacao") as Vendor["status"],
    total: r.valor_total ?? 0,
    installments: r.parcelado ?? false,
    installmentCount: r.num_parcelas ?? 0,
    installmentValue: r.valor_parcela ?? 0,
    paidInstallments: r.parcelas_pagas ?? 0,
    notes: r.observacoes ?? "",
    receipts: r.comprovantes ?? [],
  };
}

function fromInput(v: VendorInput) {
  return {
    nome: v.name,
    categoria: v.category,
    contato: v.contact,
    status: v.status,
    valor_total: v.total,
    parcelado: v.installments,
    num_parcelas: v.installmentCount,
    valor_parcela: v.installmentValue,
    parcelas_pagas: v.paidInstallments,
    observacoes: v.notes,
  };
}

export default function VendorsPage() {
  const { rows, loading, error, add, update, remove } = useList<Row>("fornecedores");
  const [adding, setAdding] = useState(false);

  const vendors = rows.map(toVendor);
  const findReceipts = (id: string) =>
    rows.find((r) => r.id === id)?.comprovantes ?? [];

  return (
    <div>
      <PageHeader
        title="Fornecedores"
        subtitle="Buffet, fotografia, decoração — com valores, parcelas e comprovantes."
      />
      {error && <Card className="mb-4 text-sm text-[#9C6C3C]">Erro: {error}</Card>}

      <div className="mb-6">
        {adding ? (
          <Card>
            <VendorForm
              onSubmit={async (data) => {
                await add({ ...fromInput(data), comprovantes: [] } as Partial<Row>);
                setAdding(false);
              }}
              onCancel={() => setAdding(false)}
            />
          </Card>
        ) : (
          <Button onClick={() => setAdding(true)}>
            <Plus size={16} /> Adicionar fornecedor
          </Button>
        )}
      </div>

      {loading ? (
        <p className="text-[#8a7b63]">Carregando...</p>
      ) : vendors.length === 0 ? (
        <Card className="text-center text-[#7d746f]">
          Nenhum fornecedor ainda. Adicione o primeiro acima.
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {vendors.map((v) => (
            <VendorRow
              key={v.id}
              vendor={v}
              onUpdate={(id, data) => update(id, fromInput(data) as Partial<Row>)}
              onRemove={(id) => remove(id)}
              onAddReceipt={(id, receipt) =>
                update(id, { comprovantes: [...findReceipts(id), receipt] } as Partial<Row>)
              }
              onRemoveReceipt={(id, receiptId) =>
                update(id, {
                  comprovantes: findReceipts(id).filter((x) => x.id !== receiptId),
                } as Partial<Row>)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
