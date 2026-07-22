import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { verificarCpfSchema } from "@/lib/validation";

// Checagem prévia (antes de criar a conta) para dar um erro amigável em vez
// de deixar o usuário só descobrir depois de preencher tudo. A garantia de
// verdade é a constraint unique em profiles.cpf, checada de novo no
// momento de gravar o perfil.
export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = verificarCpfSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "CPF inválido" }, { status: 400 });
  }

  const admin = createSupabaseAdmin();
  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("cpf", parsed.data.cpf)
    .maybeSingle();

  return NextResponse.json({ disponivel: !existing });
}
