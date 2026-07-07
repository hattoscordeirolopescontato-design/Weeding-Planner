"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton({
  className = "",
  label = "Sair",
}: {
  className?: string;
  label?: string;
}) {
  const router = useRouter();
  async function logout() {
    const sb = createClient();
    await sb.auth.signOut();
    router.push("/login");
    router.refresh();
  }
  return (
    <button
      type="button"
      onClick={logout}
      className={`inline-flex items-center gap-1.5 ${className}`}
    >
      <LogOut size={14} /> {label}
    </button>
  );
}
