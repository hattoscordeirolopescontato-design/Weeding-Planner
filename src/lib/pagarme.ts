import "server-only";

const API_BASE = "https://api.pagar.me/core/v5";

function authHeader(): string {
  const key = process.env.PAGARME_SECRET_KEY;
  if (!key) throw new Error("PAGARME_SECRET_KEY não configurada");
  // Basic Auth da Pagar.me: usuário = secret key, senha em branco.
  return "Basic " + Buffer.from(`${key}:`).toString("base64");
}

async function pagarmeRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(),
      ...init?.headers,
    },
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    // Nunca propaga o corpo cru da requisição/resposta no erro — pode conter
    // dados de cartão ou do comprador. Só a mensagem de alto nível da Pagar.me.
    const message =
      body && typeof body === "object" && "message" in body
        ? String((body as { message: unknown }).message)
        : `Pagar.me respondeu ${res.status}`;
    throw new Error(message);
  }

  return body as T;
}

export type PagarmeAddress = {
  line_1: string;
  line_2?: string;
  zip_code: string;
  city: string;
  state: string;
  country: string;
};

export type PagarmeCustomer = {
  id: string;
  name: string;
  email: string;
};

export async function createCustomer(input: {
  name: string;
  email: string;
  document: string;
  phone: string;
  address: PagarmeAddress;
}): Promise<PagarmeCustomer> {
  // Pagar.me exige ao menos um telefone do cliente para autorizar a cobrança.
  const digits = input.phone.replace(/\D/g, "");
  const areaCode = digits.slice(0, 2);
  const number = digits.slice(2);

  return pagarmeRequest<PagarmeCustomer>("/customers", {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      email: input.email,
      type: "individual",
      document: input.document,
      document_type: "CPF",
      address: input.address,
      phones: {
        mobile_phone: { country_code: "55", area_code: areaCode, number },
      },
    }),
  });
}

// Conta PSP: card_token não pode ser usado direto na criação do pedido —
// primeiro é preciso trocar o token por um card_id (ver Contexto do plano).
// billing_address vai aqui (no cartão) — a Pagar.me recusa a cobrança sem
// isso, mesmo quando o pedido já referencia o card_id.
export async function createCard(
  customerId: string,
  token: string,
  billingAddress: PagarmeAddress,
): Promise<{ id: string }> {
  return pagarmeRequest<{ id: string }>(`/customers/${customerId}/cards`, {
    method: "POST",
    body: JSON.stringify({ token, billing_address: billingAddress }),
  });
}

export type PagarmeOrder = {
  id: string;
  status: string;
  charges?: Array<{ id: string; status: string }>;
};

export async function createOrder(input: {
  customerId: string;
  cardId: string;
  amountCents: number;
  description: string;
}): Promise<PagarmeOrder> {
  return pagarmeRequest<PagarmeOrder>("/orders", {
    method: "POST",
    body: JSON.stringify({
      items: [
        { amount: input.amountCents, description: input.description, quantity: 1, code: "assinatura-wp" },
      ],
      customer_id: input.customerId,
      payments: [
        {
          payment_method: "credit_card",
          credit_card: { card_id: input.cardId },
        },
      ],
    }),
  });
}
