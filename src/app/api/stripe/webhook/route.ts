import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

function periodEnd(sub: Stripe.Subscription): string | null {
  const raw = (sub as unknown as { current_period_end?: number })
    .current_period_end;
  return raw ? new Date(raw * 1000).toISOString() : null;
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return NextResponse.json(
      { error: "Webhook não configurado (STRIPE_WEBHOOK_SECRET vazio)" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  const admin = createSupabaseAdmin();

  async function upsertSub(sub: Stripe.Subscription, userIdHint?: string) {
    const userId = (sub.metadata?.user_id as string | undefined) ?? userIdHint;
    const customerId =
      typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    const row = {
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      status: sub.status,
      current_period_end: periodEnd(sub),
    };
    if (userId) {
      await admin
        .from("subscriptions")
        .upsert({ user_id: userId, ...row }, { onConflict: "user_id" });
    } else {
      await admin
        .from("subscriptions")
        .update(row)
        .eq("stripe_customer_id", customerId);
    }
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.subscription) {
      const sub = await stripe.subscriptions.retrieve(
        session.subscription as string,
      );
      await upsertSub(sub, session.metadata?.user_id as string | undefined);
    }
  } else if (event.type.startsWith("customer.subscription.")) {
    await upsertSub(event.data.object as Stripe.Subscription);
  }

  return NextResponse.json({ received: true });
}
