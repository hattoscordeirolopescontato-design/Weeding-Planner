import Link from "next/link";
import { Card } from "@/components/ui";

// Pagamento desativado por enquanto. O processador (Pagar.me) será integrado
// depois; até lá o app fica liberado sem cobrança.
export default function AssinarPage() {
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

      <Card className="relative z-[1] w-full max-w-md text-center">
        <h2 className="font-display text-xl font-bold text-[#2B2620]">
          Assinatura em breve
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[#8a7b63]">
          Estamos finalizando o meio de pagamento. Enquanto isso, o Wedding Planner
          está <strong className="text-[#9C6C3C]">liberado gratuitamente</strong> —
          você pode usar todas as funcionalidades normalmente.
        </p>
        <Link
          href="/dashboard"
          className="btn-gold mt-6 inline-flex rounded-xl px-6 py-3 text-sm font-black shadow-[0_8px_20px_rgba(156,108,60,0.24)] transition hover:brightness-[1.03]"
        >
          Ir para o painel
        </Link>
      </Card>
    </main>
  );
}
