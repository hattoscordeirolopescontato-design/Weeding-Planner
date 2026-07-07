import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createSupabaseServer } from "@/lib/supabase/server";

// Preço criado na hora (fallback) caso o PRICE_ID não exista na conta.
const INLINE_PRICE: Stripe.Checkout.SessionCreateParams.LineItem[] = [
  {
    price_data: {
      currency: "brl",
      product_data: { name: "Plano Completo — Wedding Planner" },
      unit_amount: 3500, // R$ 35,00
      recurring: { interval: "month" },
    },
    quantity: 1,
  },
];

export async function POST(req: Request) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const origin = new URL(req.url).origin;
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const base: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    customer: sub?.stripe_customer_id ?? undefined,
    customer_email: sub?.stripe_customer_id ? undefined : user.email ?? undefined,
    client_reference_id: user.id,
    metadata: { user_id: user.id },
    subscription_data: { metadata: { user_id: user.id } },
    success_url: `${origin}/api/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/assinar`,
  };

  const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;

  const createWith = (line_items: Stripe.Checkout.SessionCreateParams.LineItem[]) =>
    stripe.checkout.sessions.create({ ...base, line_items });

  try {
    let session;
    if (priceId) {
      try {
        session = await createWith([{ price: priceId, quantity: 1 }]);
      } catch {
        // PRICE_ID inexistente/ inválido → cria o preço inline
        session = await createWith(INLINE_PRICE);
      }
    } else {
      session = await createWith(INLINE_PRICE);
    }
    return NextResponse.json({ url: session.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao criar checkout";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
