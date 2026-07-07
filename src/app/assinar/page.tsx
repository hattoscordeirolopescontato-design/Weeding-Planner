"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Card, Button } from "@/components/ui";
import { LogoutButton } from "@/components/logout-button";

const BENEFITS = [
  "Todos os módulos (fornecedores, local, convidados, agenda, checklist, presentes, lua de mel, cerimônia, cartório e votos)",
  "Armazenamento de comprovantes",
  "Acesso em qualquer dispositivo",
  "Suporte por e-mail",
];

export default function AssinarPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function assinar() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Não foi possível iniciar o pagamento.");
        setLoading(false);
      }
    } catch {
      setError("Falha de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
      {/* Orbs ambiente (liquid glass) */}
      <div
        className="pointer-events-none fixed left-[16%] top-[-140px] h-[420px] w-[420px] rounded-full"
        style={{
          background: "radial-gradient(circle at 30% 30%, rgba(252,239,192,0.55), rgba(216,180,120,0) 70%)",
          filter: "blur(10px)",
          animation: "wpFloat1 16s ease-in-out infinite",
          zIndex: 0,
        }}
      />
      <div
        className="pointer-events-none fixed right-[10%] bottom-[40px] h-[340px] w-[340px] rounded-full"
        style={{
          background: "radial-gradient(circle at 60% 40%, rgba(216,180,120,0.32), rgba(216,180,120,0) 70%)",
          filter: "blur(10px)",
          animation: "wpFloat2 20s ease-in-out infinite",
          zIndex: 0,
        }}
      />

      <div className="absolute right-4 top-4 z-[2]">
        <LogoutButton className="text-sm font-bold text-[#8a7b63] hover:text-[#9C6C3C]" />
      </div>

      <div className="relative z-[1] mb-6 flex items-center gap-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/wedding-planner-symbol.png"
          alt=""
          className="h-9 w-9 rounded-full"
          style={{ animation: "wpPulseRing 3.5s ease-in-out infinite" }}
        />
        <span className="font-display text-2xl font-bold text-[#2B2620]">
          Wedding <span className="text-[#9C6C3C]">Planner</span>
        </span>
      </div>
      <p className="relative z-[1] mb-8 text-[#8a7b63]">Planeje seu casamento com tranquilidade</p>

      <Card className="relative z-[1] w-full max-w-md">
        <div className="text-center">
          <h2 className="font-display text-xl font-bold text-[#2B2620]">
            Plano Completo
          </h2>
          <p className="font-display mt-2 text-4xl font-bold text-[#9C6C3C]">
            R$ 35,00
            <span className="text-base font-normal text-[#8a7b63]">/mês</span>
          </p>
        </div>

        <ul className="mt-6 flex flex-col gap-3">
          {BENEFITS.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm text-[#2B2620]">
              <Check size={18} className="mt-0.5 shrink-0 text-[#9C6C3C]" />
              {b}
            </li>
          ))}
        </ul>

        {error && (
          <div className="mt-4 rounded-lg bg-rose-500/12 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}

        <Button onClick={assinar} disabled={loading} className="mt-6 w-full">
          {loading ? "Redirecionando..." : "Assinar agora"}
        </Button>
        <p className="mt-3 text-center text-xs text-[#b7a98c]">
          Pagamento seguro via Stripe. Cancele quando quiser.
        </p>
      </Card>
    </main>
  );
}
