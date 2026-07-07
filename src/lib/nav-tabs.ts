// Abas que podem ser ocultadas pelo usuário.
// "Visão geral" e "Configurações" nunca entram aqui (ficam sempre visíveis).

export const HIDDEN_TABS_KEY = "hidden-tabs";

export type TabDef = { key: string; href: string; label: string };

export const HIDEABLE_TABS: TabDef[] = [
  { key: "vendors", href: "/dashboard/vendors", label: "Fornecedores" },
  { key: "venues", href: "/dashboard/venues", label: "Local" },
  { key: "ceremony", href: "/dashboard/ceremony", label: "Cerimônia" },
  { key: "guests", href: "/dashboard/guests", label: "Convidados" },
  { key: "agenda", href: "/dashboard/agenda", label: "Agenda" },
  { key: "checklist", href: "/dashboard/checklist", label: "Checklist" },
  { key: "cartorio", href: "/dashboard/cartorio", label: "Cartório" },
  { key: "honeymoon", href: "/dashboard/honeymoon", label: "Lua de Mel" },
  { key: "gifts", href: "/dashboard/gifts", label: "Presentes" },
  { key: "vows", href: "/dashboard/vows", label: "Votos" },
];
