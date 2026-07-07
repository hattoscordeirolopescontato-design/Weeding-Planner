"use client";

import { useState } from "react";
import { Button, Badge } from "@/components/ui";

export function SubscriptionSection({
  active,
  renewal,
}: {
  active: boolean;
  renewal: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function manage() {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else {
        setErr(data.error || "Não foi possível abrir o portal.");
        setLoading(false);
      }
    } catch {
      setErr("Falha de conexão.");
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-[#6B5F4F]">Status:</span>
        <Badge tone={active ? "green" : "stone"}>{active ? "Ativa" : "Inativa"}</Badge>
      </div>
      {renewal && (
        <p className="mt-2 text-sm text-[#8a7b63]">Renovação em {renewal}</p>
      )}
      <Button variant="ghost" onClick={manage} disabled={loading} className="mt-4">
        {loading ? "Abrindo..." : "Gerenciar assinatura"}
      </Button>
      {err && <p className="mt-2 text-sm text-rose-700">{err}</p>}
    </div>
  );
}
