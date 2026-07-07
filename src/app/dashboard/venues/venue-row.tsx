"use client";

import { useState } from "react";
import { MapPin, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { Card, Badge, Button } from "@/components/ui";
import { formatCurrency } from "@/lib/format";
import { venueTotal, venueSubtotal, venueTaxAmount } from "@/lib/finance";
import type { Venue, VenueType } from "@/lib/types";
import { VenueForm, type VenueInput } from "./venue-form";

const TYPE_LABEL: Record<VenueType, string> = {
  salao: "Salão de Festas",
  chacara: "Chácara/Sítio",
  hotel: "Hotel/Resort",
  externo: "Espaço Externo",
};

export function VenueRow({
  venue,
  onUpdate,
  onRemove,
}: {
  venue: Venue;
  onUpdate: (id: string, data: VenueInput) => void;
  onRemove: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <Card className={venue.isSelected ? "ring-2 ring-terracota" : undefined}>
        <VenueForm
          initial={venue}
          onSubmit={(data) => {
            onUpdate(venue.id, data);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </Card>
    );
  }

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    venue.address,
  )}`;

  return (
    <Card className={venue.isSelected ? "ring-2 ring-terracota" : undefined}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[#2B2620]">{venue.name}</h3>
            {venue.type && <Badge tone="terracota">{TYPE_LABEL[venue.type]}</Badge>}
            {venue.isSelected && <Badge tone="green">Escolhido</Badge>}
          </div>
          {venue.address && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-[#8a7b63]">
              <MapPin size={14} /> {venue.address}
            </p>
          )}
          {venue.notes && <p className="mt-1 text-sm text-[#b7a98c]">{venue.notes}</p>}
          <p className="mt-1 text-xs text-[#b7a98c]">
            {venue.fullGuests} inteiras · {venue.halfGuests} meias ·{" "}
            {venue.freeGuests} não pagantes
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[#8a7b63]">Total do local</p>
          <p className="text-lg font-semibold text-[#9C6C3C]">
            {formatCurrency(venueTotal(venue))}
          </p>
          <p className="text-xs text-[#b7a98c]">
            Subtotal {formatCurrency(venueSubtotal(venue))} + taxa{" "}
            {formatCurrency(venueTaxAmount(venue))}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-[rgba(180,144,84,0.18)] pt-3">
        {venue.address && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#9C6C3C] hover:text-[#2B2620]"
          >
            <ExternalLink size={15} /> Ver no Google Maps
          </a>
        )}
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#9C6C3C] hover:text-[#2B2620]"
        >
          <Pencil size={15} /> Editar
        </button>
        <button
          type="button"
          onClick={() => onRemove(venue.id)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#8a7b63] hover:text-rose-600"
        >
          <Trash2 size={15} /> Excluir
        </button>
      </div>
    </Card>
  );
}
