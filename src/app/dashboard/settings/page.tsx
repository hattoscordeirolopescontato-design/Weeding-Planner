import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { Card, PageHeader } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { LogoutButton } from "@/components/logout-button";
import { WeddingSettingsForm } from "./wedding-settings-form";
import { SubscriptionSection } from "./subscription-section";
import { TabVisibility } from "./tab-visibility";

export default async function SettingsPage() {
  const sb = await createSupabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await sb
    .from("profiles")
    .select("nome_noivo, nome_noiva, data_casamento, orcamento_total")
    .eq("id", user.id)
    .maybeSingle();

  const { data: sub } = await sb
    .from("subscriptions")
    .select("status, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle();

  const active =
    !!sub &&
    (sub.status === "active" || sub.status === "trialing") &&
    (!sub.current_period_end ||
      new Date(sub.current_period_end).getTime() > Date.now());

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
          active={active}
          renewal={sub?.current_period_end ? formatDate(sub.current_period_end) : null}
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
        <LogoutButton className="mt-4 rounded-xl border border-[rgba(180,144,84,0.3)] bg-[rgba(156,108,60,0.05)] px-4 py-2 text-sm font-medium text-[#2B2620] transition hover:bg-[rgba(156,108,60,0.1)]" />
      </Card>
    </div>
  );
}
