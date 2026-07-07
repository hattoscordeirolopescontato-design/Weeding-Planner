"use client";

import type { ReactNode } from "react";
import {
  LayoutDashboard,
  Handshake,
  MapPin,
  Star,
  Users,
  CalendarDays,
  ListChecks,
  FileText,
  Plane,
  Gift,
  Mail,
  Settings,
} from "lucide-react";
import { NavLink } from "@/components/nav-link";
import { useLocalStore } from "@/lib/use-local-store";
import { HIDDEN_TABS_KEY, HIDEABLE_TABS } from "@/lib/nav-tabs";

const ICONS: Record<string, ReactNode> = {
  vendors: <Handshake size={18} strokeWidth={1.75} />,
  venues: <MapPin size={18} strokeWidth={1.75} />,
  ceremony: <Star size={18} strokeWidth={1.75} />,
  guests: <Users size={18} strokeWidth={1.75} />,
  agenda: <CalendarDays size={18} strokeWidth={1.75} />,
  checklist: <ListChecks size={18} strokeWidth={1.75} />,
  cartorio: <FileText size={18} strokeWidth={1.75} />,
  honeymoon: <Plane size={18} strokeWidth={1.75} />,
  gifts: <Gift size={18} strokeWidth={1.75} />,
  vows: <Mail size={18} strokeWidth={1.75} />,
};

export function DashboardNav() {
  const [hidden, , loaded] = useLocalStore<string[]>(HIDDEN_TABS_KEY, []);
  // Antes de carregar a preferência, mostra tudo (evita esconder por engano).
  const hiddenSet = new Set(loaded ? hidden : []);

  return (
    <nav className="relative flex flex-1 flex-wrap gap-1 overflow-auto pt-1 lg:flex-col lg:flex-nowrap">
      <NavLink href="/dashboard" icon={<LayoutDashboard size={18} strokeWidth={1.75} />}>
        Visão geral
      </NavLink>

      {HIDEABLE_TABS.filter((t) => !hiddenSet.has(t.key)).map((t) => (
        <NavLink key={t.key} href={t.href} icon={ICONS[t.key]}>
          {t.label}
        </NavLink>
      ))}

      <NavLink href="/dashboard/settings" icon={<Settings size={18} strokeWidth={1.75} />}>
        Configurações
      </NavLink>
    </nav>
  );
}
