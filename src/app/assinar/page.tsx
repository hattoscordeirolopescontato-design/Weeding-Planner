"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import Link from "next/link";
import { Check, Lock } from "lucide-react";
import { Card, Field, Input } from "@/components/ui";
import { PRICE, priceWithCoupon, COUPONS } from "@/lib/pricing";

// Payload que o tokenizecard.js entrega ao callback de sucesso: os campos
// não mapeados (nome, email, cpf...) voltam do jeito que estavam no form, e o
// token gerado vem numa chave "pagarmetoken-N" (N = índice do form na página,
// confirmado testando em sandbox — não é `data.token` como a doc sugere).
type TokenizeSuccessData = Record<string, string>;

function extractCardToken(data: TokenizeSuccessData): string | undefined {
  const key = Object.keys(data).find((k) => k.startsWith("pagarmetoken"));
  return key ? data[key] : undefined;
}

declare global {
  interface Window {
    PagarmeCheckout?: {
      init: (
        success: (data: TokenizeSuccessData) => boolean,
        fail: (error: unknown) => boolean,
      ) => void;
    };
  }
}

export default function AssinarPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const enderecoRef = useRef<HTMLInputElement>(null);
  const cidadeRef = useRef<HTMLInputElement>(null);
  const estadoRef = useRef<HTMLInputElement>(null);
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [bairro, setBairro] = useState("");
  const [cepLoading, setCepLoading] = useState(false);

  const priceAfterDiscount = priceWithCoupon(appliedCoupon);
  const discount = PRICE - priceAfterDiscount;

  function handleApplyCoupon() {
    const code = coupon.trim().toUpperCase();
    if (!code) return;
    if (COUPONS[code]) {
      setAppliedCoupon(code);
    } else {
      setAppliedCoupon(null);
      setNotice("Cupom inválido.");
    }
  }

  async function handleCepBlur(e: React.FocusEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data.erro) {
        setNotice("CEP não encontrado. Preencha o endereço manualmente.");
      } else {
        if (enderecoRef.current) enderecoRef.current.value = data.logradouro ?? "";
        if (cidadeRef.current) cidadeRef.current.value = data.localidade ?? "";
        if (estadoRef.current) estadoRef.current.value = data.uf ?? "";
        setBairro(data.bairro ?? "");
      }
    } catch {
      setNotice("Não foi possível buscar o CEP. Preencha o endereço manualmente.");
    } finally {
      setCepLoading(false);
    }
  }

  function initPagarmeCheckout() {
    window.PagarmeCheckout?.init(
      (data) => {
        void handleTokenized(data);
        return false; // sempre bloqueia o submit nativo da lib — o fetch cuida do resto
      },
      () => {
        setNotice("Não foi possível processar os dados do cartão. Confira e tente novamente.");
        setSubmitting(false);
        return false;
      },
    );
  }

  async function handleTokenized(data: TokenizeSuccessData) {
    const token = extractCardToken(data);
    if (!token) {
      setNotice("Não foi possível gerar o token do cartão. Confira os dados e tente novamente.");
      return;
    }

    const form = formRef.current;
    if (!form) return;
    setSubmitting(true);
    setNotice(null);

    const fd = new FormData(form);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardToken: token,
          buyerName: fd.get("nome"),
          buyerEmail: fd.get("email"),
          buyerDocument: fd.get("cpf"),
          buyerPhone: fd.get("telefone"),
          zipCode: fd.get("cep"),
          address: fd.get("endereco"),
          number: fd.get("numero"),
          complement: fd.get("complemento"),
          neighborhood: fd.get("bairro"),
          city: fd.get("cidade"),
          state: fd.get("estado"),
          couponCode: appliedCoupon,
        }),
      });
      const result = await res.json();

      if (!res.ok) {
        setNotice(result.error ?? "Não foi possível concluir o pagamento. Tente novamente.");
        return;
      }

      if (result.status === "paid") {
        setNotice("Pagamento aprovado! Redirecionando...");
        router.refresh();
        router.push("/dashboard");
      } else if (result.status === "pending" || result.status === "processing") {
        setNotice("Pagamento em análise. Você será avisado assim que for confirmado.");
      } else {
        setNotice("Pagamento recusado. Confira os dados do cartão e tente novamente.");
      }
    } catch {
      setNotice("Erro de conexão ao processar o pagamento. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center overflow-hidden px-4 py-12">
      <Script
        src="https://checkout.pagar.me/v1/tokenizecard.js"
        data-pagarmecheckout-app-id={process.env.NEXT_PUBLIC_PAGARME_PUBLIC_KEY}
        strategy="afterInteractive"
        onLoad={initPagarmeCheckout}
      />

      {/* Orbs ambiente (liquid glass) */}
      <div
        className="pointer-events-none fixed left-[16%] top-[-140px] h-[420px] w-[420px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(252,239,192,0.55), rgba(216,180,120,0) 70%)",
          filter: "blur(10px)",
          animation: "wpFloat1 16s ease-in-out infinite",
          zIndex: 0,
        }}
      />
      <div
        className="pointer-events-none fixed right-[10%] bottom-[40px] h-[340px] w-[340px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 60% 40%, rgba(216,180,120,0.32), rgba(216,180,120,0) 70%)",
          filter: "blur(10px)",
          animation: "wpFloat2 20s ease-in-out infinite",
          zIndex: 0,
        }}
      />

      <div className="relative z-[1] mb-8 flex items-center gap-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/wedding-planner-symbol.png"
          alt=""
          className="h-9 w-9 rounded-full"
          style={{ animation: "wpPulseRing 3.5s ease-in-out infinite" }}
        />
        <span className="font-display text-2xl font-bold text-[#2B2620]">
          Wedding <span className="text-[#9C6C3C]">Planner</span>
        </span>
      </div>

      <form
        ref={formRef}
        data-pagarmecheckout-form
        id="payment-form"
        className="relative z-[1] flex w-full max-w-4xl flex-col gap-6 lg:flex-row lg:items-start"
      >
        {/* FORM */}
        <Card className="flex-1">
          <h1 className="font-display text-2xl font-bold text-[#2B2620]">
            Finalizar assinatura
          </h1>
          <p className="mt-1.5 text-[13.5px] text-[#8a7b63]">
            R$ 39,90/mês. Cancele quando quiser.
          </p>

          <div className="mt-7 text-[12.5px] font-bold uppercase tracking-wide text-[#9C6C3C]">
            Dados pessoais
          </div>
          <div className="mt-3">
            <Field label="Nome completo" htmlFor="nome">
              <Input id="nome" name="nome" placeholder="Seu nome completo" required />
            </Field>
          </div>
          <div className="mt-3.5 flex gap-3.5">
            <div className="flex-1">
              <Field label="E-mail" htmlFor="email">
                <Input id="email" name="email" type="email" placeholder="voce@email.com" required />
              </Field>
            </div>
            <div className="flex-1">
              <Field label="CPF" htmlFor="cpf">
                <Input id="cpf" name="cpf" placeholder="000.000.000-00" required />
              </Field>
            </div>
          </div>
          <div className="mt-3.5">
            <Field label="Telefone" htmlFor="telefone">
              <Input
                id="telefone"
                name="telefone"
                type="tel"
                placeholder="(11) 98888-7777"
                required
              />
            </Field>
          </div>

          <div className="mt-6 text-[12.5px] font-bold uppercase tracking-wide text-[#9C6C3C]">
            Endereço de cobrança
          </div>
          <div className="mt-3 flex gap-3.5">
            <div className="flex-1">
              <Field
                label="CEP"
                htmlFor="cep"
                hint={cepLoading ? "Buscando endereço..." : undefined}
              >
                <Input
                  id="cep"
                  name="cep"
                  placeholder="00000-000"
                  onBlur={handleCepBlur}
                  required
                />
              </Field>
            </div>
            <div className="w-[110px]">
              <Field label="Número" htmlFor="numero">
                <Input id="numero" name="numero" placeholder="Nº" required />
              </Field>
            </div>
          </div>
          <div className="mt-3.5 flex gap-3.5">
            <div className="flex-[2]">
              <Field label="Endereço" htmlFor="endereco">
                <Input
                  id="endereco"
                  name="endereco"
                  ref={enderecoRef}
                  placeholder="Rua"
                  required
                />
              </Field>
            </div>
            <div className="flex-1">
              <Field label="Complemento" htmlFor="complemento">
                <Input
                  id="complemento"
                  name="complemento"
                  placeholder="Apto, bloco... (opcional)"
                />
              </Field>
            </div>
          </div>
          <div className="mt-3.5 flex gap-3.5">
            <div className="flex-1">
              <Field label="Cidade" htmlFor="cidade">
                <Input id="cidade" name="cidade" ref={cidadeRef} placeholder="Sua cidade" required />
              </Field>
            </div>
            <div className="w-[80px]">
              <Field label="Estado" htmlFor="estado">
                <Input
                  id="estado"
                  name="estado"
                  ref={estadoRef}
                  placeholder="UF"
                  maxLength={2}
                  required
                />
              </Field>
            </div>
          </div>
          <input type="hidden" name="bairro" value={bairro} />

          <div className="mt-6 text-[12.5px] font-bold uppercase tracking-wide text-[#9C6C3C]">
            Cartão de crédito
          </div>
          <div className="mt-3">
            <Field label="Número do cartão" htmlFor="cartao">
              <Input
                id="cartao"
                data-pagarmecheckout-element="number"
                inputMode="numeric"
                placeholder="0000 0000 0000 0000"
                autoComplete="off"
                required
              />
            </Field>
          </div>
          <div className="mt-3.5 flex gap-3.5">
            <div className="flex-1">
              <Field label="Nome impresso no cartão" htmlFor="nomeCartao">
                <Input
                  id="nomeCartao"
                  data-pagarmecheckout-element="holder_name"
                  placeholder="NOME COMO NO CARTÃO"
                  required
                />
              </Field>
            </div>
            <div className="w-[60px]">
              <Field label="Mês" htmlFor="expMes">
                <Input
                  id="expMes"
                  data-pagarmecheckout-element="exp_month"
                  inputMode="numeric"
                  placeholder="MM"
                  maxLength={2}
                  autoComplete="off"
                  required
                />
              </Field>
            </div>
            <div className="w-[60px]">
              <Field label="Ano" htmlFor="expAno">
                <Input
                  id="expAno"
                  data-pagarmecheckout-element="exp_year"
                  inputMode="numeric"
                  placeholder="AA"
                  maxLength={2}
                  autoComplete="off"
                  required
                />
              </Field>
            </div>
            <div className="w-[90px]">
              <Field label="CVV" htmlFor="cvv">
                <Input
                  id="cvv"
                  data-pagarmecheckout-element="cvv"
                  inputMode="numeric"
                  placeholder="000"
                  autoComplete="off"
                  required
                />
              </Field>
            </div>
          </div>
        </Card>

        {/* RESUMO */}
        <Card className="w-full lg:w-[320px] lg:flex-none">
          <div className="flex justify-between text-sm text-[#5C5142]">
            <span>Plano Wedding Planner</span>
            <span className="font-bold text-[#2B2620]">
              R$ {PRICE.toFixed(2).replace(".", ",")}/mês
            </span>
          </div>
          <div className="mt-5">
            <Field label="Cupom de desconto" htmlFor="cupom">
              <div className="flex gap-2">
                <Input
                  id="cupom"
                  value={coupon}
                  onChange={(e) => {
                    setCoupon(e.target.value);
                    setNotice(null);
                  }}
                  placeholder="Digite o cupom"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="btn-gold shrink-0 rounded-xl px-4 text-[13.5px] font-bold shadow-[0_4px_12px_rgba(156,108,60,0.2)]"
                >
                  Aplicar
                </button>
              </div>
            </Field>
            {appliedCoupon && (
              <div className="mt-2 flex items-center gap-1.5 text-[12.5px] font-bold text-[#2A8F5C]">
                <Check size={13} strokeWidth={2.5} />
                Cupom aplicado: {Math.round((discount / PRICE) * 100)}% de desconto
              </div>
            )}
          </div>

          <div className="my-5 h-px bg-[rgba(156,108,60,0.18)]" />

          {appliedCoupon && (
            <>
              <div className="flex justify-between text-sm text-[#5C5142]">
                <span>Desconto ({appliedCoupon})</span>
                <span className="font-bold text-[#2A8F5C]">
                  - R$ {discount.toFixed(2).replace(".", ",")}
                </span>
              </div>
              <div className="my-5 h-px bg-[rgba(156,108,60,0.18)]" />
            </>
          )}

          <div className="flex justify-between text-[15px]">
            <span className="font-bold text-[#2B2620]">Cobrado agora</span>
            <span className="font-extrabold text-[#2B2620]">
              R$ {priceAfterDiscount.toFixed(2).replace(".", ",")}
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-gold mt-7 w-full rounded-full py-3.5 text-center text-[15.5px] font-black shadow-[0_10px_26px_rgba(156,108,60,0.3)] transition hover:brightness-[1.03] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Processando..."
              : `Assinar por R$ ${priceAfterDiscount.toFixed(2).replace(".", ",")}/mês`}
          </button>
          <div className="mt-3.5 flex items-center justify-center gap-1.5 text-xs text-[#8a7b63]">
            <Lock size={13} strokeWidth={2} />
            Pagamento seguro e criptografado
          </div>

          {notice && (
            <p className="mt-4 rounded-xl bg-[rgba(156,108,60,0.08)] p-3 text-xs leading-relaxed text-[#6B5F4F]">
              {notice}
            </p>
          )}

          <p className="mt-4 text-xs leading-relaxed text-[#8a7b63]">
            Ao continuar, R$ {priceAfterDiscount.toFixed(2).replace(".", ",")} será cobrado
            agora no cartão informado. A renovação mensal automática ainda não está
            disponível nesta versão.
          </p>
        </Card>
      </form>

      <Link
        href="/dashboard"
        className="relative z-[1] mt-6 text-sm font-medium text-[#8a7b63] hover:text-[#9C6C3C]"
      >
        Voltar para o painel
      </Link>
    </main>
  );
}
