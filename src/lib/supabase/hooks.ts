"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

/** Usuário autenticado atual. */
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
  }, []);
  return { user, loading };
}

type Row = { id: string; [k: string]: unknown };

/** CRUD de uma tabela "lista" (várias linhas por usuário). RLS filtra por usuário. */
export function useList<T extends Row>(table: string) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    const sb = createClient();
    setLoading(true);
    const { data, error } = await sb
      .from(table)
      .select("*")
      .order("created_at", { ascending: true });
    if (error) setError(error.message);
    else setRows((data ?? []) as T[]);
    setLoading(false);
  }, [table]);

  useEffect(() => {
    reload();
  }, [reload]);

  const add = useCallback(
    async (values: Partial<T>): Promise<T | null> => {
      const sb = createClient();
      const {
        data: { user },
      } = await sb.auth.getUser();
      const { data, error } = await sb
        .from(table)
        .insert({ ...values, user_id: user?.id } as Record<string, unknown>)
        .select()
        .single();
      if (error) {
        setError(error.message);
        return null;
      }
      setRows((r) => [...r, data as T]);
      return data as T;
    },
    [table],
  );

  const update = useCallback(
    async (id: string, values: Partial<T>) => {
      const sb = createClient();
      const { data, error } = await sb
        .from(table)
        .update(values as Record<string, unknown>)
        .eq("id", id)
        .select()
        .single();
      if (error) {
        setError(error.message);
        return;
      }
      setRows((r) => r.map((x) => (x.id === id ? (data as T) : x)));
    },
    [table],
  );

  const remove = useCallback(
    async (id: string) => {
      const sb = createClient();
      const { error } = await sb.from(table).delete().eq("id", id);
      if (error) {
        setError(error.message);
        return;
      }
      setRows((r) => r.filter((x) => x.id !== id));
    },
    [table],
  );

  return { rows, loading, error, add, update, remove, reload };
}

/** Tabela "single" (uma linha por usuário, user_id unique). Upsert por usuário. */
export function useSingle<T extends Record<string, unknown>>(table: string) {
  const [row, setRow] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    const sb = createClient();
    setLoading(true);
    const { data, error } = await sb.from(table).select("*").limit(1).maybeSingle();
    if (error) setError(error.message);
    else setRow((data as T) ?? null);
    setLoading(false);
  }, [table]);

  useEffect(() => {
    reload();
  }, [reload]);

  const save = useCallback(
    async (values: Partial<T>) => {
      const sb = createClient();
      const {
        data: { user },
      } = await sb.auth.getUser();
      const payload = { ...(row ?? {}), ...values, user_id: user?.id };
      const { data, error } = await sb
        .from(table)
        .upsert(payload as Record<string, unknown>, { onConflict: "user_id" })
        .select()
        .single();
      if (error) {
        setError(error.message);
        return;
      }
      setRow(data as T);
    },
    [table, row],
  );

  return { row, loading, error, save, reload, setRow };
}
