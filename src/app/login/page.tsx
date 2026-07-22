"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  GoldAuthShell,
  GoldButton,
  PasswordInput,
  authInput,
  authLabel,
  authLink,
  serifStyle,
} from "@/components/gold-auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const sb = createClient();
    const { error } = await sb.auth.signInWithPassword({ email, password: senha });
    setLoading(false);
    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : error.message,
      );
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <GoldAuthShell
      tagline="Bem-vinda ao planejamento do seu grande dia."
      subtitle="Fornecedores, orçamento, convidados e checklist, tudo em um só lugar, exatamente onde você deixou."
    >
      <div className="text-center text-3xl font-bold text-[#2B2620]" style={serifStyle}>
        Entrar na sua conta
      </div>
      <div className="mt-2 text-center text-sm text-[#8A7B63]">
        Continue o planejamento do seu casamento.
      </div>

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

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="senha" className="text-[13px] font-bold text-[#6B5F4F]">
              Senha
            </label>
            <Link href="/recuperar-senha" className={authLink}>
              Esqueceu a senha?
            </Link>
          </div>
          <PasswordInput
            id="senha"
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <label className="flex cursor-pointer items-center gap-2.5">
          <input
            type="checkbox"
            className="h-[17px] w-[17px] rounded-[5px] border-[1.5px] border-[#D8B478] accent-[#9C6C3C]"
          />
          <span className="text-[13px] text-[#6B5F4F]">Manter conectada</span>
        </label>

        <GoldButton type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </GoldButton>
      </form>

      <div className="mt-8 text-center text-sm text-[#6B5F4F]">
        Ainda não tem uma conta?{" "}
        <Link href="/cadastro" className="text-sm font-bold text-[#9C6C3C] hover:text-[#7A521E] hover:underline">
          Criar conta
        </Link>
      </div>
    </GoldAuthShell>
  );
}
