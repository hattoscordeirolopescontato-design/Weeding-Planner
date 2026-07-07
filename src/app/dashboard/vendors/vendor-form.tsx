"use client";

import { useState } from "react";
import { Field, Input, Select, Textarea, Button } from "@/components/ui";
import type { Vendor } from "@/lib/types";

export type VendorInput = Omit<Vendor, "id" | "receipts">;

const blank: VendorInput = {
  name: "",
  category: "",
  contact: "",
  status: "cotacao",
  total: 0,
  installments: false,
  installmentCount: 0,
  installmentValue: 0,
  paidInstallments: 0,
  notes: "",
};

const num = (s: string) => {
  const n = parseFloat(s.replace(",", "."));
  return isNaN(n) ? 0 : n;
};

export function VendorForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Vendor;
  onSubmit: (data: VendorInput) => void;
  onCancel?: () => void;
}) {
  const [data, setData] = useState<VendorInput>(
    initial
      ? {
          name: initial.name,
          category: initial.category,
          contact: initial.contact,
          status: initial.status,
          total: initial.total,
          installments: initial.installments,
          installmentCount: initial.installmentCount,
          installmentValue: initial.installmentValue,
          paidInstallments: initial.paidInstallments,
          notes: initial.notes,
        }
      : blank,
  );

  const set = <K extends keyof VendorInput>(key: K, value: VendorInput[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!data.name.trim()) return;
    onSubmit(data);
    if (!initial) setData(blank);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nome">
          <Input
            value={data.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
        </Field>
        <Field label="Categoria" hint="Ex.: Buffet, Fotografia, Decoração">
          <Input
            value={data.category}
            onChange={(e) => set("category", e.target.value)}
          />
        </Field>
        <Field label="Contato">
          <Input
            value={data.contact}
            onChange={(e) => set("contact", e.target.value)}
            placeholder="Telefone ou e-mail"
          />
        </Field>
        <Field label="Status">
          <Select
            value={data.status}
            onChange={(e) => set("status", e.target.value as Vendor["status"])}
          >
            <option value="cotacao">Em cotação</option>
            <option value="contratado">Contratado</option>
            <option value="pago">Pago</option>
            <option value="cancelado">Cancelado</option>
          </Select>
        </Field>
        <Field label="Valor total contratado (R$)">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={data.total || ""}
            onChange={(e) => set("total", num(e.target.value))}
          />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-[#33302e]">
        <input
          type="checkbox"
          checked={data.installments}
          onChange={(e) => set("installments", e.target.checked)}
          className="h-4 w-4 rounded border-[rgba(180,144,84,0.3)] bg-white accent-[#9C6C3C]"
        />
        Pagamento parcelado?
      </label>

      {data.installments && (
        <div className="grid grid-cols-1 gap-4 rounded-xl bg-[rgba(156,108,60,0.05)] p-3 sm:grid-cols-3">
          <Field label="Nº de parcelas">
            <Input
              type="number"
              min="0"
              value={data.installmentCount || ""}
              onChange={(e) => set("installmentCount", num(e.target.value))}
            />
          </Field>
          <Field label="Valor por parcela (R$)">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={data.installmentValue || ""}
              onChange={(e) => set("installmentValue", num(e.target.value))}
            />
          </Field>
          <Field label="Parcelas já pagas">
            <Input
              type="number"
              min="0"
              value={data.paidInstallments || ""}
              onChange={(e) => set("paidInstallments", num(e.target.value))}
            />
          </Field>
        </div>
      )}

      <Field label="Observações">
        <Textarea
          value={data.notes}
          onChange={(e) => set("notes", e.target.value)}
        />
      </Field>

      <div className="flex items-center gap-3">
        <Button type="submit">{initial ? "Salvar alterações" : "Adicionar fornecedor"}</Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
