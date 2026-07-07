"use client";

import { useState } from "react";
import { Trash2, Pencil } from "lucide-react";
import { Card, Badge } from "@/components/ui";
import { Attachments } from "@/components/file-attachments";
import { formatCurrency } from "@/lib/format";
import { vendorPaid, vendorRemaining } from "@/lib/finance";
import type { Vendor, Receipt } from "@/lib/types";
import { VendorForm, type VendorInput } from "./vendor-form";

const STATUS_LABEL: Record<string, string> = {
  cotacao: "Em cotação",
  contratado: "Contratado",
  pago: "Pago",
  cancelado: "Cancelado",
};
const STATUS_TONE: Record<string, "amber" | "blue" | "green" | "stone"> = {
  cotacao: "amber",
  contratado: "blue",
  pago: "green",
  cancelado: "stone",
};

export function VendorRow({
  vendor,
  onUpdate,
  onRemove,
  onAddReceipt,
  onRemoveReceipt,
}: {
  vendor: Vendor;
  onUpdate: (id: string, data: VendorInput) => void;
  onRemove: (id: string) => void;
  onAddReceipt: (id: string, receipt: Receipt) => void;
  onRemoveReceipt: (id: string, receiptId: string) => void;
}) {
  const [editing, setEditing] = useState(false);

  const paid = vendorPaid(vendor);
  const remaining = vendorRemaining(vendor);

  if (editing) {
    return (
      <Card>
        <VendorForm
          initial={vendor}
          onSubmit={(data) => {
            onUpdate(vendor.id, data);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[#2B2620]">{vendor.name}</h3>
            <Badge tone={STATUS_TONE[vendor.status]}>
              {STATUS_LABEL[vendor.status]}
            </Badge>
          </div>
          {vendor.category && (
            <p className="text-sm text-[#7d746f]">{vendor.category}</p>
          )}
          {vendor.contact && (
            <p className="mt-1 text-sm text-[#7d746f]">{vendor.contact}</p>
          )}
          {vendor.notes && (
            <p className="mt-1 text-sm text-[#8a7b63]">{vendor.notes}</p>
          )}
        </div>
        <div className="text-right">
          <p className="font-display text-xl font-semibold text-[#9C6C3C]">
            {formatCurrency(vendor.total)}
          </p>
          {vendor.installments && vendor.installmentCount > 0 && (
            <p className="text-xs text-[#8a7b63]">
              {vendor.paidInstallments}/{vendor.installmentCount} parcelas de{" "}
              {formatCurrency(vendor.installmentValue)}
            </p>
          )}
        </div>
      </div>

      {vendor.total > 0 && (
        <div className="mt-3 flex gap-6 text-sm">
          <span className="text-emerald-700">Pago: {formatCurrency(paid)}</span>
          <span className="text-amber-700">Restante: {formatCurrency(remaining)}</span>
        </div>
      )}

      <div className="mt-4">
        <Attachments
          receipts={vendor.receipts}
          onAdd={(r) => onAddReceipt(vendor.id, r)}
          onRemove={(rid) => onRemoveReceipt(vendor.id, rid)}
        />
      </div>

      <div className="mt-4 flex items-center gap-4 border-t border-[rgba(180,144,84,0.18)] pt-3">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#9C6C3C] hover:text-[#7a521e]"
        >
          <Pencil size={15} /> Editar
        </button>
        <button
          type="button"
          onClick={() => onRemove(vendor.id)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#8a7b63] hover:text-rose-600"
        >
          <Trash2 size={15} /> Excluir
        </button>
      </div>
    </Card>
  );
}
