import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

// Cancelamento self-service: não apaga nada, só marca a data. O dashboard
// (layout) trava a edição enquanto assinatura_cancelada_em estiver
// preenchido. Exclusão de conta continua exigindo contato com o suporte.
export async function POST() {
  const sb = await createSupabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { error } = await sb
    .from("profiles")
    .update({ assinatura_cancelada_em: new Date().toISOString() })
    .eq("id", user.id);
  if (error) {
    return NextResponse.json({ error: "Não foi possível cancelar a assinatura." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
