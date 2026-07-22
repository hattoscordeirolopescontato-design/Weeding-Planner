import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

const STATUS_BY_EVENT: Record<string, string> = {
  "order.paid": "paid",
  "order.payment_failed": "failed",
  "order.canceled": "canceled",
};

// A Pagar.me v5 (cadastro de webhook pelo painel) não assina o corpo com
// HMAC — ela autentica via Basic Auth com usuário/senha definidos por nós
// no próprio painel (Configurações > Webhooks > Habilitar autenticação).
function hasValidAuth(header: string | null, user: string, pass: string): boolean {
  if (!header?.startsWith("Basic ")) return false;
  const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
  const [sentUser, sentPass] = decoded.split(":");
  if (!sentUser || !sentPass) return false;

  const userBuf = Buffer.from(sentUser);
  const expectedUserBuf = Buffer.from(user);
  const passBuf = Buffer.from(sentPass);
  const expectedPassBuf = Buffer.from(pass);
  const userOk =
    userBuf.length === expectedUserBuf.length && crypto.timingSafeEqual(userBuf, expectedUserBuf);
  const passOk =
    passBuf.length === expectedPassBuf.length && crypto.timingSafeEqual(passBuf, expectedPassBuf);
  return userOk && passOk;
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const user = process.env.PAGARME_WEBHOOK_USER;
  const pass = process.env.PAGARME_WEBHOOK_SECRET;

  // Sem usuário/senha ainda configurados, a autenticação não pode ser
  // checada — só o suficiente para destravar o desenvolvimento local. Não
  // usar assim em produção.
  if (user && pass && !hasValidAuth(req.headers.get("authorization"), user, pass)) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const status = STATUS_BY_EVENT[payload?.type];
  const orderId = payload?.data?.id;

  if (status && orderId) {
    const admin = createSupabaseAdmin();
    const { data: updated } = await admin
      .from("pedidos_pagarme")
      .update({ status, raw_response: payload, updated_at: new Date().toISOString() })
      .eq("pagarme_order_id", orderId)
      .select("user_id")
      .maybeSingle();

    // Pagamento confirmado depois de um cancelamento anterior = reativação.
    if (status === "paid" && updated?.user_id) {
      await admin
        .from("profiles")
        .update({ assinatura_cancelada_em: null })
        .eq("id", updated.user_id);
    }
  }

  // Responde 200 mesmo para eventos não tratados — evita retries desnecessários.
  return NextResponse.json({ ok: true });
}
