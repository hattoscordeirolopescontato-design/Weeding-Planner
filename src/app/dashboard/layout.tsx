import { redirect } from "next/navigation";
import Link from "next/link";
import { Lock } from "lucide-react";
import { createSupabaseServer } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/dashboard-nav";
import { LogoutButton } from "@/components/logout-button";
import { billingPeriodEndsAt } from "@/lib/billing";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) redirect("/login");
  const user = session.user;

  let { data: profile } = await supabase
    .from("profiles")
    .select("nome_noivo, nome_noiva, data_casamento, assinatura_cancelada_em")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    const meta = (user.user_metadata ?? {}) as Record<string, string | null>;
    await supabase.from("profiles").upsert({
      id: user.id,
      nome_noivo: meta.nome_noivo ?? null,
      nome_noiva: meta.nome_noiva ?? null,
      data_casamento: meta.data_casamento ?? null,
    });
    profile = {
      nome_noivo: meta.nome_noivo ?? null,
      nome_noiva: meta.nome_noiva ?? null,
      data_casamento: meta.data_casamento ?? null,
      assinatura_cancelada_em: null,
    };
  }

  // Cobrança é única, não recorrente: cada pagamento aprovado libera 1 mês
  // de acesso (mesmo dia do mês seguinte). Depois disso, trava como se
  // tivesse cancelado — precisa pagar de novo pra desbloquear.
  const { data: ultimoPago } = await supabase
    .from("pedidos_pagarme")
    .select("created_at")
    .eq("status", "paid")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const periodoExpirado = ultimoPago
    ? new Date() > billingPeriodEndsAt(ultimoPago.created_at)
    : false;

  const isLocked = !!profile.assinatura_cancelada_em || periodoExpirado;

  const title =
    [profile?.nome_noivo, profile?.nome_noiva].filter(Boolean).join(" & ") ||
    "Nosso casamento";

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Orbs ambiente (liquid glass) */}
      <div
        className="pointer-events-none fixed left-[16%] top-[-140px] h-[420px] w-[420px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(252,239,192,0.55), rgba(216,180,120,0) 70%)",
          filter: "blur(10px)",
          animation: "wpFloat1 16s ease-in-out infinite",
          zIndex: 0,
        }}
      />
      <div
        className="pointer-events-none fixed right-[8%] top-[120px] h-[360px] w-[360px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 60% 40%, rgba(216,180,120,0.35), rgba(216,180,120,0) 70%)",
          filter: "blur(10px)",
          animation: "wpFloat2 20s ease-in-out infinite",
          zIndex: 0,
        }}
      />
      <div
        className="pointer-events-none fixed bottom-[-100px] left-[45%] h-[300px] w-[300px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 40% 60%, rgba(156,108,60,0.22), rgba(156,108,60,0) 70%)",
          filter: "blur(10px)",
          animation: "wpFloat3 24s ease-in-out infinite",
          zIndex: 0,
        }}
      />

      <div className="relative z-[1] mx-auto flex min-h-screen max-w-[1440px] flex-col lg:flex-row">
        {/* SIDEBAR — painel flutuante de vidro claro */}
        <aside
          className="relative flex flex-col overflow-hidden lg:m-6 lg:w-[264px] lg:shrink-0"
          style={{
            background:
              "linear-gradient(165deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.28) 100%)",
            backdropFilter: "blur(34px) saturate(200%)",
            WebkitBackdropFilter: "blur(34px) saturate(200%)",
            border: "1px solid rgba(255,255,255,0.7)",
            borderRadius: "26px",
            boxShadow:
              "0 24px 60px rgba(156,108,60,0.16), inset 0 1px 0 rgba(255,255,255,0.9)",
            padding: "24px 16px",
          }}
        >
          {/* Sheen estático */}
          <div
            className="pointer-events-none absolute left-[-20%] top-[-40%] h-[60%] w-[140%] rotate-[8deg]"
            style={{
              background:
                "linear-gradient(120deg, transparent 20%, rgba(255,255,255,0.55) 45%, transparent 70%)",
            }}
          />

          <div className="relative flex items-center gap-3 px-2.5 pb-[22px] pt-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/wedding-planner-symbol.png"
              alt=""
              className="h-[34px] w-[34px] rounded-full"
              style={{ animation: "wpPulseRing 3.5s ease-in-out infinite" }}
            />
            <div>
              <div className="font-display text-base font-bold leading-tight text-[#2B2620]">
                Wedding Planner
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9C6C3C]">
                Painel do casal
              </div>
            </div>
          </div>

          <DashboardNav />

          <div className="relative mt-3.5 border-t border-[rgba(156,108,60,0.16)] pt-3.5">
            <div
              className="rounded-[14px] p-3.5"
              style={{
                background: "rgba(255,255,255,0.4)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.7)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
              }}
            >
              <div className="truncate text-[13px] font-bold text-[#2B2620]">{title}</div>
              <div className="mt-0.5 truncate text-xs text-[#8A7B63]">{user.email}</div>
              <LogoutButton className="mt-3 text-[13px] font-bold text-[#9C6C3C] hover:text-[#7a521e]" />
            </div>
          </div>
        </aside>

        {/* CONTEÚDO */}
        <main className="flex-1 overflow-auto px-6 py-8 sm:px-10 lg:px-14 lg:py-12">
          {isLocked && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[rgba(180,144,84,0.35)] bg-[rgba(156,108,60,0.08)] px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(156,108,60,0.14)]">
                  <Lock size={16} className="text-[#9C6C3C]" />
                </div>
                <p className="text-sm font-medium text-[#6B5F4F]">
                  {profile.assinatura_cancelada_em
                    ? "Sua assinatura foi cancelada. Seus dados continuam salvos, mas o painel fica travado para edição até você reativar."
                    : "Seu período pago acabou. Seus dados continuam salvos, mas o painel fica travado para edição até renovar."}
                </p>
              </div>
              <Link
                href="/assinar"
                className="btn-gold shrink-0 rounded-full px-4 py-1.5 text-[13px] font-bold shadow-[0_4px_12px_rgba(156,108,60,0.2)]"
              >
                Reativar assinatura
              </Link>
            </div>
          )}
          <div className={isLocked ? "pointer-events-none select-none opacity-60 grayscale" : ""}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
