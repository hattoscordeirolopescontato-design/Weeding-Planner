import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { DashboardOverview } from "./overview-client";

export default async function DashboardPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome_noivo, nome_noiva, data_casamento, orcamento_total")
    .eq("id", user.id)
    .maybeSingle();

  const [{ count: guestCount }, { data: confirmados }] = await Promise.all([
    supabase.from("convidados").select("*", { count: "exact", head: true }),
    supabase
      .from("convidados")
      .select("acompanhantes")
      .eq("status", "confirmado"),
  ]);

  const confirmedPeople =
    (confirmados?.length ?? 0) +
    (confirmados?.reduce(
      (a, g: { acompanhantes: number | null }) => a + (g.acompanhantes ?? 0),
      0,
    ) ?? 0);

  const title =
    [profile?.nome_noivo, profile?.nome_noiva].filter(Boolean).join(" & ") ||
    "Nosso casamento";

  return (
    <DashboardOverview
      title={title}
      date={profile?.data_casamento ?? null}
      budget={profile?.orcamento_total ?? null}
      guestCount={guestCount ?? 0}
      confirmedPeople={confirmedPeople}
    />
  );
}
