import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

const STATUS_BY_EVENT: Record<string, string> = {
  "order.paid": "paid",
  "order.payment_failed": "failed",
  "order.canceled": "canceled",
  "order.refunded": "refunded",
};

function hasValidSignature(rawBody: string, header: string | null, secret: string): boolean {
  if (!header) return false;
  const hash = header.split("=")[1];
  if (!hash) return false;

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuf = Buffer.from(expected);
  const hashBuf = Buffer.from(hash);
  if (expectedBuf.length !== hashBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, hashBuf);
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const secret = process.env.PAGARME_WEBHOOK_SECRET;

  // Sem o secret ainda configurado (pendente até cadastrar a URL pública no
  // painel Pagar.me), a assinatura não pode ser checada — só o suficiente
  // para destravar o desenvolvimento local. Não usar assim em produção.
  if (secret && !hasValidSignature(rawBody, req.headers.get("x-hub-signature"), secret)) {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  const payload = JSON.parse(rawBody);
  const status = STATUS_BY_EVENT[payload?.type];
  const orderId = payload?.data?.id;

  if (status && orderId) {
    const admin = createSupabaseAdmin();
    await admin
      .from("pedidos_pagarme")
      .update({ status, raw_response: payload, updated_at: new Date().toISOString() })
      .eq("pagarme_order_id", orderId);
  }

  // Responde 200 mesmo para eventos não tratados — evita retries desnecessários.
  return NextResponse.json({ ok: true });
}
