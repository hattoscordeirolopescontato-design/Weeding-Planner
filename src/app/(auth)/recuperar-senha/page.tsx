"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  GoldAuthShell,
  GoldButton,
  authInput,
  authLabel,
  serifStyle,
} from "@/components/gold-auth";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const sb = createClient();
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo:
        typeof window !== "undefined" ? `${window.location.origin}/login` : undefined,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <GoldAuthShell
      tagline="Vamos recuperar o seu acesso."
      subtitle="Sem estresse. Enviamos um link e você volta a planejar em instantes."
    >
      <div className="text-center text-3xl font-bold text-[#2B2620]" style={serifStyle}>
        Recuperar senha
      </div>
      <div className="mt-2 text-center text-sm text-[#8A7B63]">
        Enviaremos um link de recuperação para o seu e-mail.
      </div>

      {sent ? (
        <div className="mt-9 rounded-[10px] bg-[#eef7ef] px-3 py-3 text-sm text-[#2e7d47]">
          Se existir uma conta com esse e-mail, o link de recuperação foi enviado.
          Confira sua caixa de entrada.
        </div>
      ) : (
        <form onSubmit={submit} className="mt-9 flex flex-col gap-5">
          {error && (
            <div className="rounded-[10px] bg-rose-500/12 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className={authLabel}>
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seunome@email.com"
              required
              className={authInput}
            />
          </div>
          <GoldButton type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Enviar link de recuperação"}
          </GoldButton>
        </form>
      )}

      <div className="mt-8 text-center text-sm text-[#6B5F4F]">
        <Link href="/login" className="text-sm font-bold text-[#9C6C3C] hover:text-[#7A521E] hover:underline">
          Voltar ao login
        </Link>
      </div>
    </GoldAuthShell>
  );
}
