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
  serifStyle,
} from "@/components/gold-auth";

export default function CadastroPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    if (senha.length < 6) {
      setError("A senha deve ter ao menos 6 caracteres.");
      return;
    }
    if (senha !== confirmar) {
      setError("As senhas não conferem.");
      return;
    }
    setLoading(true);
    const sb = createClient();
    const { data, error } = await sb.auth.signUp({ email, password: senha });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (!data.session) {
      setInfo(
        "Conta criada! Confirme seu e-mail pelo link que enviamos e depois faça login.",
      );
      return;
    }
    router.push("/completar-perfil");
    router.refresh();
  }

  return (
    <GoldAuthShell
      tagline="Comece a planejar o seu grande dia."
      subtitle="Crie sua conta e organize fornecedores, orçamento, convidados, cerimônia e muito mais, tudo em um só lugar."
    >
      <div className="text-center text-3xl font-bold text-[#2B2620]" style={serifStyle}>
        Criar conta
      </div>
      <div className="mt-2 text-center text-sm text-[#8A7B63]">
        Leva menos de um minuto.
      </div>

      <form onSubmit={submit} className="mt-9 flex flex-col gap-5">
        {error && (
          <div className="rounded-[10px] bg-rose-500/12 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}
        {info && (
          <div className="rounded-[10px] bg-[#eef7ef] px-3 py-2 text-sm text-[#2e7d47]">
            {info}
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
          <label htmlFor="senha" className={authLabel}>
            Senha
          </label>
          <PasswordInput
            id="senha"
            autoComplete="new-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Mínimo de 6 caracteres"
            required
          />
        </div>

        <div>
          <label htmlFor="confirmar" className={authLabel}>
            Confirmar senha
          </label>
          <PasswordInput
            id="confirmar"
            autoComplete="new-password"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <GoldButton type="submit" disabled={loading}>
          {loading ? "Criando..." : "Criar conta"}
        </GoldButton>
      </form>

      <div className="mt-8 text-center text-sm text-[#6B5F4F]">
        Já tem uma conta?{" "}
        <Link href="/login" className="text-sm font-bold text-[#9C6C3C] hover:text-[#7A521E] hover:underline">
          Entrar
        </Link>
      </div>
    </GoldAuthShell>
  );
}
