import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { Card, PageHeader } from "@/components/ui";
import { LogoutButton } from "@/components/logout-button";
import { WhatsAppIcon, whatsappHref } from "@/components/whatsapp";
import { billingPeriodEndsAt } from "@/lib/billing";
import { WeddingSettingsForm } from "./wedding-settings-form";
import { SubscriptionSection } from "./subscription-section";
import { TabVisibility } from "./tab-visibility";

const DELETE_ACCOUNT_MESSAGE = "Olá! Quero excluir minha conta do Wedding Planner.";

export default async function SettingsPage() {
  const sb = await createSupabaseServer();
  const {
    data: { session },
  } = await sb.auth.getSession();
  if (!session) redirect("/login");
  const user = session.user;

  const { data: profile } = await sb
    .from("profiles")
    .select("nome_noivo, nome_noiva, data_casamento, orcamento_total, assinatura_cancelada_em")
    .eq("id", user.id)
    .maybeSingle();

  const { data: pedido } = await sb
    .from("pedidos_pagarme")
    .select("status, valor, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: ultimoPago } = await sb
    .from("pedidos_pagarme")
    .select("created_at")
    .eq("status", "paid")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const validoAte = ultimoPago ? billingPeriodEndsAt(ultimoPago.created_at) : null;
  const periodoExpirado = validoAte ? new Date() > validoAte : false;

  return (
    <div className="max-w-2xl">
      <PageHeader title="Configurações" subtitle="Dados do casamento, assinatura e conta." />

      <Card>
        <h2 className="font-display mb-4 text-xl font-semibold text-[#9C6C3C]">Casamento</h2>
        <WeddingSettingsForm
          userId={user.id}
          initial={{
            nomeNoivo: profile?.nome_noivo ?? "",
            nomeNoiva: profile?.nome_noiva ?? "",
            data: profile?.data_casamento
              ? String(profile.data_casamento).slice(0, 10)
              : "",
            orcamento: profile?.orcamento_total ?? 0,
          }}
        />
      </Card>

      <Card className="mt-6">
        <h2 className="font-display mb-4 text-xl font-semibold text-[#9C6C3C]">Assinatura</h2>
        <SubscriptionSection
          pedido={pedido}
          canceladoEm={profile?.assinatura_cancelada_em ?? null}
          validoAte={validoAte ? validoAte.toISOString() : null}
          periodoExpirado={periodoExpirado}
        />
      </Card>

      <Card className="mt-6">
        <h2 className="font-display mb-4 text-xl font-semibold text-[#9C6C3C]">
          Abas visíveis
        </h2>
        <TabVisibility />
      </Card>

      <Card className="mt-6">
        <h2 className="font-display mb-2 text-xl font-semibold text-[#9C6C3C]">Conta</h2>
        <p className="text-sm text-[#b7a98c]">{user.email}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <LogoutButton className="rounded-xl border border-[rgba(180,144,84,0.3)] bg-[rgba(156,108,60,0.05)] px-4 py-2 text-sm font-medium text-[#2B2620] transition hover:bg-[rgba(156,108,60,0.1)]" />
          <a
            href={whatsappHref(DELETE_ACCOUNT_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-[rgba(180,144,84,0.3)] px-4 py-2 text-sm font-medium text-[#2B2620] transition hover:bg-[rgba(156,108,60,0.05)]"
          >
            <WhatsAppIcon size={16} className="text-[#25D366]" />
            Excluir minha conta
          </a>
        </div>
        <p className="mt-2 text-xs text-[#b7a98c]">
          Cancelar a assinatura não apaga sua conta. Para excluir tudo, fale com o suporte.
        </p>
      </Card>
    </div>
  );
}
