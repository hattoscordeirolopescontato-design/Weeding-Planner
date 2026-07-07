"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

/** Gera um id único (browser). */
export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

const PREFIX = "cse:"; // Wedding Planner (prefixo legado mantido p/ não resetar preferências)

/**
 * Estado persistido em localStorage. SSR-safe: começa com `initial` e
 * hidrata a partir do storage no cliente.
 * Retorna [valor, setValor, carregado].
 */
export function useLocalStore<T>(
  key: string,
  initial: T,
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const fullKey = PREFIX + key;
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(fullKey);
      if (raw != null) setValue(JSON.parse(raw) as T);
    } catch {
      // ignora json inválido
    }
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullKey]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(fullKey, JSON.stringify(value));
    } catch {
      // storage cheio / indisponível — falha silenciosa
    }
  }, [fullKey, value, loaded]);

  return [value, setValue, loaded];
}
