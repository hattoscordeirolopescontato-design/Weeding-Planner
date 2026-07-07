"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";
import { vowSchema, vowUnlockSchema, fieldErrors, type FormState } from "@/lib/validation";
import { encryptVow, decryptVow } from "@/lib/vows-crypto";

const PATH = "/dashboard/vows";

export type VowReadState =
  | { ok?: boolean; content?: string; title?: string; message?: string }
  | undefined;

async function auth() {
  const sb = await createSupabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/login");
  return { sb, user };
}

export async function createVow(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { sb, user } = await auth();
  const parsed = vowSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const { title, content, password } = parsed.data;
  const enc = encryptVow(content, password);
  const { error } = await sb.from("votos").insert({
    user_id: user.id,
    titulo: title,
    ciphertext: enc.ciphertext,
    iv: enc.iv,
    salt: enc.salt,
    auth_tag: enc.authTag,
  });
  if (error) return { message: error.message };

  revalidatePath(PATH);
  return { ok: true, message: "Votos guardados com segurança!" };
}

export async function unlockVow(
  _prev: VowReadState,
  formData: FormData,
): Promise<VowReadState> {
  const { sb } = await auth();
  const id = String(formData.get("id"));
  const parsed = vowUnlockSchema.safeParse({ password: formData.get("password") });
  if (!parsed.success) return { message: "Informe a senha." };

  const { data: vow } = await sb.from("votos").select("*").eq("id", id).maybeSingle();
  if (!vow) return { message: "Voto não encontrado." };

  try {
    const content = decryptVow(
      { ciphertext: vow.ciphertext, iv: vow.iv, salt: vow.salt, authTag: vow.auth_tag },
      parsed.data.password,
    );
    return { ok: true, content, title: vow.titulo };
  } catch {
    return { message: "Senha incorreta." };
  }
}

export async function updateVow(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { sb } = await auth();
  const id = String(formData.get("id"));
  const parsed = vowSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const { title, content, password } = parsed.data;
  const enc = encryptVow(content, password);
  const { error } = await sb
    .from("votos")
    .update({
      titulo: title,
      ciphertext: enc.ciphertext,
      iv: enc.iv,
      salt: enc.salt,
      auth_tag: enc.authTag,
    })
    .eq("id", id);
  if (error) return { message: error.message };

  revalidatePath(PATH);
  return { ok: true, message: "Votos atualizados!" };
}

export async function deleteVow(formData: FormData): Promise<void> {
  const { sb } = await auth();
  const id = String(formData.get("id"));
  await sb.from("votos").delete().eq("id", id);
  revalidatePath(PATH);
}
