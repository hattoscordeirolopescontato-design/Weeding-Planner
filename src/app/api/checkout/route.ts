import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { checkoutSchema, fieldErrors } from "@/lib/validation";
import { priceWithCoupon } from "@/lib/pricing";
import { createCustomer, createCard, createOrder } from "@/lib/pagarme";

export async function POST(req: Request) {
  const sb = await createSupabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ errors: fieldErrors(parsed.error) }, { status: 400 });
  }
  const data = parsed.data;

  // Valor sempre recalculado no servidor a partir do cupom — nunca confia num
  // valor vindo do frontend.
  const amount = priceWithCoupon(data.couponCode);
  const amountCents = Math.round(amount * 100);

  const admin = createSupabaseAdmin();

  // O CPF único é checado no cadastro (dono da conta) — o CPF do
  // pagamento é só um dado da Pagar.me e pode ser de outra pessoa (quem
  // está pagando não precisa ser quem criou a conta).
  const cpf = data.buyerDocument.replace(/\D/g, "");

  try {
    // Pagar.me espera line_1 no formato "número, rua, bairro" (nessa ordem)
    // para prevenção de fraude.
    const line1Parts = [data.number, data.address, data.neighborhood].filter(Boolean);
    const billingAddress = {
      line_1: line1Parts.join(", "),
      line_2: data.complement || undefined,
      zip_code: data.zipCode,
      city: data.city,
      state: data.state,
      country: "BR",
    };

    const customer = await createCustomer({
      name: data.buyerName,
      email: data.buyerEmail,
      document: cpf,
      phone: data.buyerPhone,
      address: billingAddress,
    });

    const card = await createCard(customer.id, data.cardToken, billingAddress);

    const order = await createOrder({
      customerId: customer.id,
      cardId: card.id,
      amountCents,
      description: "Assinatura Wedding Planner",
    });

    const charge = order.charges?.[0];
    const status = charge?.status ?? order.status;

    const { error: dbError } = await admin.from("pedidos_pagarme").upsert(
      {
        user_id: user.id,
        pagarme_order_id: order.id,
        pagarme_card_id: card.id,
        status,
        valor: amount,
      },
      { onConflict: "pagarme_order_id" },
    );
    if (dbError) {
      // O pagamento já foi processado na Pagar.me — só o registro local falhou.
      // Não falha a resposta por isso, mas precisa ficar visível para investigar.
      console.error("Falha ao gravar pedidos_pagarme:", dbError.message);
    }

    // Pagamento aprovado depois de um cancelamento anterior = reativação.
    if (status === "paid") {
      await admin
        .from("profiles")
        .update({ assinatura_cancelada_em: null })
        .eq("id", user.id);
    }

    return NextResponse.json({ status, orderId: order.id });
  } catch (e) {
    // Nunca loga o corpo da requisição (token, endereço, etc.) — só a mensagem.
    const message = e instanceof Error ? e.message : "Erro ao processar pagamento";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
