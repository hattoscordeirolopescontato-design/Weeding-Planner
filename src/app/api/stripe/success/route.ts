import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

// Confirma o pagamento e grava a assinatura no Supabase, depois leva ao dashboard.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.redirect(new URL("/assinar", url.origin));
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });
    const userId =
      (session.metadata?.user_id as string | undefined) ??
      (session.client_reference_id as string | null) ??
      undefined;
    const subscription = session.subscription as Stripe.Subscription | null;

    if (userId && subscription) {
      const admin = createSupabaseAdmin();
      await admin.from("subscriptions").upsert(
        {
          user_id: userId,
          stripe_customer_id:
            typeof session.customer === "string"
              ? session.customer
              : (session.customer?.id ?? null),
          stripe_subscription_id: subscription.id,
          status: subscription.status,
          current_period_end: (() => {
            const raw = (
              subscription as unknown as { current_period_end?: number }
            ).current_period_end;
            return raw ? new Date(raw * 1000).toISOString() : null;
          })(),
        },
        { onConflict: "user_id" },
      );
    }
  } catch {
    // segue para o dashboard mesmo assim; o webhook reconcilia depois
  }

  return NextResponse.redirect(new URL("/completar-perfil", url.origin));
}
