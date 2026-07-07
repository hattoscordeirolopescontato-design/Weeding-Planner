import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Cliente com a service role key — IGNORA RLS. Usar APENAS no servidor
 * (ex.: webhook do Stripe atualizando assinaturas). Nunca no cliente.
 */
export function createSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
