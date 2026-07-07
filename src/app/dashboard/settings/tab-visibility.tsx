"use client";

import { useLocalStore } from "@/lib/use-local-store";
import { HIDDEN_TABS_KEY, HIDEABLE_TABS } from "@/lib/nav-tabs";

export function TabVisibility() {
  const [hidden, setHidden, loaded] = useLocalStore<string[]>(HIDDEN_TABS_KEY, []);

  const isVisible = (key: string) => !hidden.includes(key);
  const toggle = (key: string) =>
    setHidden((h) =>
      h.includes(key) ? h.filter((k) => k !== key) : [...h, key],
    );

  return (
    <div>
      <p className="mb-3 text-sm text-[#8a7b63]">
        Escolha quais abas aparecem no menu lateral. &quot;Visão geral&quot; e
        &quot;Configurações&quot; ficam sempre visíveis.
      </p>
      <ul className="flex flex-col gap-2">
        {HIDEABLE_TABS.map((t) => {
          const visible = loaded ? isVisible(t.key) : true;
          return (
            <li
              key={t.key}
              className="flex items-center justify-between rounded-lg bg-[rgba(156,108,60,0.05)] px-3 py-2"
            >
              <span className="text-sm text-[#2B2620]">{t.label}</span>
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-[#8a7b63]">
                <input
                  type="checkbox"
                  checked={visible}
                  onChange={() => toggle(t.key)}
                  className="h-4 w-4 rounded border-[rgba(180,144,84,0.35)] bg-[rgba(156,108,60,0.08)] accent-terracota"
                />
                {visible ? "Visível" : "Oculta"}
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
