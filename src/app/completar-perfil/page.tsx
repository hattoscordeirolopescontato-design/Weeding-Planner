"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  GoldAuthShell,
  GoldButton,
  authInput,
  authLabel,
  serifStyle,
} from "@/components/gold-auth";

export default function CompletarPerfilPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [nomeNoivo, setNomeNoivo] = useState("");
  const [nomeNoiva, setNomeNoiva] = useState("");
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      setUserId(user.id);
      const { data: profile } = await sb
        .from("profiles")
        .select("nome_noivo, nome_noiva, data_casamento")
        .eq("id", user.id)
        .maybeSingle();
      if (profile) {
        setNomeNoivo(profile.nome_noivo ?? "");
        setNomeNoiva(profile.nome_noiva ?? "");
        setData(profile.data_casamento ? String(profile.data_casamento).slice(0, 10) : "");
      }
      setLoading(false);
    })();
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    setError("");
    const sb = createClient();
    const { error } = await sb.from("profiles").upsert({
      id: userId,
      nome_noivo: nomeNoivo,
      nome_noiva: nomeNoiva,
      data_casamento: data || null,
    });
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <GoldAuthShell
      tagline="O seu grande dia começa aqui."
      subtitle="Só mais um passo para deixarmos tudo com a sua cara."
    >
      <div className="text-center text-3xl font-bold text-[#2B2620]" style={serifStyle}>
        Quase lá!
      </div>
      <div className="mt-2 text-center text-sm text-[#8A7B63]">
        Conte um pouco sobre o casamento para começar.
      </div>

      {loading ? (
        <p className="mt-9 text-center text-sm text-[#8A7B63]">Carregando...</p>
      ) : (
        <form onSubmit={submit} className="mt-9 flex flex-col gap-5">
          {error && (
            <div className="rounded-[10px] bg-rose-500/12 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="nn" className={authLabel}>
                Nome do noivo
              </label>
              <input
                id="nn"
                value={nomeNoivo}
                onChange={(e) => setNomeNoivo(e.target.value)}
                required
                className={authInput}
              />
            </div>
            <div>
              <label htmlFor="nv" className={authLabel}>
                Nome da noiva
              </label>
              <input
                id="nv"
                value={nomeNoiva}
                onChange={(e) => setNomeNoiva(e.target.value)}
                required
                className={authInput}
              />
            </div>
          </div>
          <div>
            <label htmlFor="dc" className={authLabel}>
              Data do casamento
            </label>
            <input
              id="dc"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className={authInput}
            />
          </div>
          <GoldButton type="submit" disabled={saving}>
            {saving ? "Salvando..." : "Acessar o painel"}
          </GoldButton>
        </form>
      )}
    </GoldAuthShell>
  );
}
