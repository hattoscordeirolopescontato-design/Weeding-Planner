"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CancelSubscriptionButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function cancelar() {
    const ok = window.confirm(
      "Cancelar sua assinatura? Seus dados continuam salvos, mas você não vai conseguir editar nada até reativar.",
    );
    if (!ok) return;

    setLoading(true);
    setError("");
    const res = await fetch("/api/assinatura/cancelar", { method: "POST" });
    setLoading(false);
    if (!res.ok) {
      setError("Não foi possível cancelar. Tente novamente.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-2">
      {error && <p className="mb-1.5 text-xs font-medium text-rose-700">{error}</p>}
      <button
        type="button"
        onClick={cancelar}
        disabled={loading}
        className="text-sm font-bold text-rose-700 hover:underline disabled:opacity-60"
      >
        {loading ? "Cancelando..." : "Cancelar assinatura"}
      </button>
    </div>
  );
}
