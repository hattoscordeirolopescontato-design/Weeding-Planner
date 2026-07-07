// Tipos compartilhados dos módulos persistidos em localStorage.

export type Receipt = {
  id: string;
  name: string;
  dataUrl: string; // base64
  uploadedAt: string; // ISO
};

export type Vendor = {
  id: string;
  name: string;
  category: string;
  contact: string;
  status: "cotacao" | "contratado" | "pago" | "cancelado";
  total: number; // valor total contratado
  installments: boolean; // parcelado?
  installmentCount: number; // nº de parcelas
  installmentValue: number; // valor por parcela
  paidInstallments: number; // parcelas já pagas
  notes: string;
  receipts: Receipt[];
};

export type VenueType = "salao" | "chacara" | "hotel" | "externo";

export type VenueChargeType =
  | "per_person_all" // por pessoa (todos)
  | "per_person_paying" // por pessoa (pagantes)
  | "per_child" // por criança
  | "fixed"; // valor fixo

export type VenueService = {
  id: string;
  name: string;
  chargeType: VenueChargeType;
  unitValue: number;
  quantity: number; // usado quando aplicável
  inTaxBase: boolean; // entra na base de cálculo da taxa
};

export type Venue = {
  id: string;
  name: string;
  type: VenueType | "";
  address: string;
  // estrutura de cobrança de convidados
  totalGuests: number;
  fullGuests: number; // inteira
  halfGuests: number; // meia entrada
  freeGuests: number; // não pagantes
  pricePerFull: number; // valor por pessoa (inteira)
  pricePerHalf: number; // valor meia entrada
  taxPercent: number; // taxa % sobre o total (opcional)
  services: VenueService[];
  notes: string;
  isSelected: boolean;
};

// Responsável (usado em Agenda e Checklist)
export type Responsavel = "ambos" | "noivo" | "noiva";

export type AgendaType = "visita" | "prova" | "reuniao" | "outro";

export type AgendaItem = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  description: string;
  type: AgendaType;
  owner: Responsavel;
};

export type ChecklistCategory =
  | "12 meses antes"
  | "6 meses antes"
  | "1 mês antes"
  | "Semana do casamento";

export type ChecklistItem = {
  id: string;
  category: ChecklistCategory;
  title: string;
  done: boolean;
  custom: boolean;
  owner: Responsavel;
};

// ---------------------------------------------------------------------------
// Lua de Mel
// ---------------------------------------------------------------------------

export type HoneymoonLodging = {
  id: string;
  name: string;
  bookingUrl: string;
  price: number;
  status: "confirmado" | "pendente";
  receipts: Receipt[];
};

export type HoneymoonFlight = {
  id: string;
  airline: string;
  flightNumber: string;
  price: number;
  receipts: Receipt[];
};

export type HoneymoonDay = {
  id: string;
  title: string;
  activities: string;
};

export type HoneymoonTask = {
  id: string;
  title: string;
  done: boolean;
  custom: boolean;
};

export type Honeymoon = {
  destination: string;
  altDestination: string;
  departDate: string;
  returnDate: string;
  budget: number;
  lodging: HoneymoonLodging[];
  flights: HoneymoonFlight[];
  itinerary: HoneymoonDay[];
  checklist: HoneymoonTask[];
};

// ---------------------------------------------------------------------------
// Presentes
// ---------------------------------------------------------------------------

export type GiftCategory = "casa" | "eletro" | "viagem" | "experiencia" | "outro";
export type GiftPriority = "alta" | "media" | "baixa";
export type GiftStatus = "disponivel" | "ganho" | "reservado";

export type Gift = {
  id: string;
  name: string;
  category: GiftCategory;
  storeUrl: string;
  price: number;
  priority: GiftPriority;
  status: GiftStatus;
  gifter: string;
};

export type GiftsData = {
  pixKey: string;
  items: Gift[];
};

// ---------------------------------------------------------------------------
// Cartório
// ---------------------------------------------------------------------------

export type DocStatus = "pendente" | "separado" | "entregue";
export type DocPerson = "noivo" | "noiva" | "casal";

export type CartorioDoc = {
  id: string;
  person: DocPerson;
  label: string;
  status: DocStatus;
  receipts: Receipt[];
};

export type Witness = {
  id: string;
  name: string;
  rg: string;
};

export type Cartorio = {
  name: string;
  address: string;
  contact: string;
  habilitacaoDate: string;
  cerimoniaDate: string;
  docs: CartorioDoc[];
  witnesses: Witness[];
  pacto: boolean;
  notes: string;
};

// ---------------------------------------------------------------------------
// Cerimônia
// ---------------------------------------------------------------------------

export type CeremonyType = "religiosa" | "civil" | "simbolica" | "mista";

export type CeremonyStep = {
  id: string;
  description: string;
  time: string;
  note: string;
};

export type CeremonyMusicMoment =
  | "Entrada dos padrinhos"
  | "Entrada da noiva"
  | "Durante a cerimônia"
  | "Saída";

export type CeremonyMusic = {
  id: string;
  moment: CeremonyMusicMoment;
  title: string;
  artist: string;
  link: string;
};

export type Ceremony = {
  type: CeremonyType | "";
  celebrant: string;
  celebrantContact: string;
  duration: string;
  steps: CeremonyStep[];
  music: CeremonyMusic[];
  notes: string;
};
