import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

// Callback do OAuth (Google) — fluxo PKCE do @supabase/ssr.
// O Supabase redireciona para cá com ?code=... ; trocamos o code pela sessão
// (que grava os cookies) e mandamos o usuário para o destino certo.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const oauthError =
    url.searchParams.get("error_description") || url.searchParams.get("error");

  if (oauthError) {
    const to = new URL("/login", url.origin);
    to.searchParams.set("error", oauthError);
    return NextResponse.redirect(to);
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login", url.origin));
  }

  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const to = new URL("/login", url.origin);
    to.searchParams.set("error", error.message);
    return NextResponse.redirect(to);
  }

  // Usuário novo (sem nome no perfil) → completar-perfil; caso contrário → dashboard.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let destination = "/dashboard";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("nome_noivo, nome_noiva")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile || (!profile.nome_noivo && !profile.nome_noiva)) {
      destination = "/completar-perfil";
    }
  }

  return NextResponse.redirect(new URL(destination, url.origin));
}
