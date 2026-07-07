import type { Vendor, Venue, VenueService } from "@/lib/types";

// ---------------------------------------------------------------------------
// Local (venue)
// ---------------------------------------------------------------------------

export function venueGuestBase(v: Venue): number {
  return v.pricePerFull * v.fullGuests + v.pricePerHalf * v.halfGuests;
}

export function venueServiceCost(v: Venue, s: VenueService): number {
  const paying = v.fullGuests + v.halfGuests;
  switch (s.chargeType) {
    case "per_person_all":
      return s.unitValue * v.totalGuests;
    case "per_person_paying":
      return s.unitValue * paying;
    case "per_child":
      return s.unitValue * (s.quantity || 0);
    case "fixed":
      return s.unitValue * (s.quantity > 0 ? s.quantity : 1);
    default:
      return 0;
  }
}

export function venueServicesTotal(v: Venue): number {
  return v.services.reduce((acc, s) => acc + venueServiceCost(v, s), 0);
}

export function venueSubtotal(v: Venue): number {
  return venueGuestBase(v) + venueServicesTotal(v);
}

/** Base sobre a qual a taxa % incide: base de convidados + serviços marcados. */
export function venueTaxBase(v: Venue): number {
  const services = v.services
    .filter((s) => s.inTaxBase)
    .reduce((acc, s) => acc + venueServiceCost(v, s), 0);
  return venueGuestBase(v) + services;
}

export function venueTaxAmount(v: Venue): number {
  return (venueTaxBase(v) * (v.taxPercent || 0)) / 100;
}

export function venueTotal(v: Venue): number {
  return venueSubtotal(v) + venueTaxAmount(v);
}

// ---------------------------------------------------------------------------
// Fornecedores (vendors)
// ---------------------------------------------------------------------------

export function vendorPaid(v: Vendor): number {
  if (v.installments) return v.paidInstallments * v.installmentValue;
  return v.status === "pago" ? v.total : 0;
}

export function vendorRemaining(v: Vendor): number {
  return Math.max(0, v.total - vendorPaid(v));
}
