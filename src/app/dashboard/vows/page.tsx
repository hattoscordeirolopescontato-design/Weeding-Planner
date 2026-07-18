import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { createSupabaseServer } from "@/lib/supabase/server";
import { Card, PageHeader } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { VowForm } from "./vow-form";
import { VowCard } from "./vow-card";
import { createVow } from "./actions";

export default async function VowsPage() {
  const sb = await createSupabaseServer();
  const {
    data: { session },
  } = await sb.auth.getSession();
  if (!session) redirect("/login");

  const { data: vows } = await sb
    .from("votos")
    .select("id, titulo, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader
        title="Votos"
        subtitle="Seus votos são cifrados com a sua senha. Nem o administrador do site consegue lê-los."
      />

      <details className="group mb-6">
        <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-xl bg-[#9C6C3C] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#7a521e]">
          <Plus size={16} /> Escrever votos
        </summary>
        <Card className="mt-3">
          <VowForm action={createVow} />
        </Card>
      </details>

      {!vows || vows.length === 0 ? (
        <Card className="text-center text-[#8a7b63]">
          Você ainda não guardou nenhum voto.
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {vows.map((v: { id: string; titulo: string; created_at: string }) => (
            <VowCard
              key={v.id}
              vow={{
                id: v.id,
                title: v.titulo ?? "Meus votos",
                updatedAt: formatDate(v.created_at),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
