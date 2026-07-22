import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const TRIAL_DAYS = 7;

// "proxy" é o middleware do Next.js 16 (runtime Node).
// Renova a sessão do Supabase, exige login para a área do app e bloqueia o
// dashboard sem um pedido pago na Pagar.me (após os 7 dias grátis).
export async function proxy(req: NextRequest) {
  let res = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = req.nextUrl;
  const isAuthPage = pathname === "/login" || pathname === "/cadastro";
  const needsAuth =
    pathname.startsWith("/dashboard") || pathname.startsWith("/completar-perfil");

  if (!user && needsAuth) {
    const url = new URL("/login", req.nextUrl);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  // Gate de pagamento: dashboard é liberado nos primeiros 7 dias após o
  // cadastro (trial); depois disso exige um pedido pago na Pagar.me.
  // (/completar-perfil fica de fora — só exige login, não pagamento.)
  if (user && pathname.startsWith("/dashboard")) {
    const createdAt = new Date(user.created_at).getTime();
    const trialEndsAt = createdAt + TRIAL_DAYS * 24 * 60 * 60 * 1000;
    const inTrial = Date.now() < trialEndsAt;

    if (!inTrial) {
      const { data: pedido } = await supabase
        .from("pedidos_pagarme")
        .select("id")
        .eq("status", "paid")
        .limit(1)
        .maybeSingle();

      if (!pedido) {
        return NextResponse.redirect(new URL("/assinar", req.nextUrl));
      }
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
