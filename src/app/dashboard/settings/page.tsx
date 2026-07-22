import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { Card, PageHeader } from "@/components/ui";
import { LogoutButton } from "@/components/logout-button";
import { WhatsAppIcon, whatsappHref } from "@/components/whatsapp";
import { WeddingSettingsForm } from "./wedding-settings-form";
import { SubscriptionSection } from "./subscription-section";
import { TabVisibility } from "./tab-visibility";

const CANCEL_MESSAGE = "Olá! Quero cancelar minha assinatura do Wedding Planner.";

export default async function SettingsPage() {
  const sb = await createSupabaseServer();
  const {
    data: { session },
  } = await sb.auth.getSession();
  if (!session) redirect("/login");
  const user = session.user;

  const { data: profile } = await sb
    .from("profiles")
    .select("nome_noivo, nome_noiva, data_casamento, orcamento_total")
    .eq("id", user.id)
    .maybeSingle();

  const { data: pedido } = await sb
    .from("pedidos_pagarme")
    .select("status, valor, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

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
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-[#9C6C3C]">Assinatura</h2>
          <a
            href={whatsappHref(CANCEL_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Cancelar assinatura pelo WhatsApp"
            title="Quer cancelar? Fale com o suporte pelo WhatsApp"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_4px_12px_rgba(37,211,102,0.35)] transition hover:brightness-105"
          >
            <WhatsAppIcon size={18} />
          </a>
        </div>
        <SubscriptionSection pedido={pedido} />
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
        <LogoutButton className="mt-4 rounded-xl border border-[rgba(180,144,84,0.3)] bg-[rgba(156,108,60,0.05)] px-4 py-2 text-sm font-medium text-[#2B2620] transition hover:bg-[rgba(156,108,60,0.1)]" />
      </Card>
    </div>
  );
}
