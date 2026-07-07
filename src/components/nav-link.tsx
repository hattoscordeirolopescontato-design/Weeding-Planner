"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const active =
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-[10px] border px-3 py-2.5 text-sm transition"
      style={
        active
          ? {
              background:
                "linear-gradient(135deg, rgba(252,239,192,0.55), rgba(216,180,120,0.4))",
              borderColor: "rgba(255,255,255,0.8)",
              boxShadow:
                "0 4px 14px rgba(156,108,60,0.2), inset 0 1px 0 rgba(255,255,255,0.9)",
            }
          : { borderColor: "transparent" }
      }
    >
      <span
        className={`flex shrink-0 ${active ? "text-[#9C6C3C]" : "text-[#8A7B63]"}`}
      >
        {icon}
      </span>
      <span
        className={
          active ? "font-bold text-[#2B2620]" : "font-semibold text-[#6B5F4F]"
        }
      >
        {children}
      </span>
    </Link>
  );
}
