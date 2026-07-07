"use client";

import { useActionState } from "react";
import { Lock, Unlock, Pencil, Trash2 } from "lucide-react";
import { Card, Field, Input } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { VowForm } from "./vow-form";
import { unlockVow, updateVow, deleteVow, type VowReadState } from "./actions";

export function VowCard({
  vow,
}: {
  vow: { id: string; title: string; updatedAt: string };
}) {
  const [state, action] = useActionState<VowReadState, FormData>(
    unlockVow,
    undefined,
  );

  return (
    <Card>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {state?.ok ? (
            <Unlock size={18} className="text-[#9C6C3C]" />
          ) : (
            <Lock size={18} className="text-[#9C6C3C]" />
          )}
          <h3 className="font-semibold text-[#2B2620]">{vow.title}</h3>
        </div>
        <span className="text-xs text-[#b7a98c]">atualizado em {vow.updatedAt}</span>
      </div>

      {state?.ok ? (
        <div className="mt-4">
          <article className="whitespace-pre-wrap rounded-xl bg-[rgba(156,108,60,0.05)] p-4 text-sm leading-relaxed text-[#2B2620]">
            {state.content}
          </article>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#8a7b63] hover:text-[#7a521e]"
          >
            <Lock size={14} /> Ocultar novamente
          </button>
        </div>
      ) : (
        <form action={action} className="mt-4 flex items-end gap-3">
          <input type="hidden" name="id" value={vow.id} />
          <div className="flex-1">
            <Field label="Senha" htmlFor={`unlock-${vow.id}`} error={state?.message}>
              <Input
                id={`unlock-${vow.id}`}
                name="password"
                type="password"
                placeholder="Digite a senha para revelar"
              />
            </Field>
          </div>
          <SubmitButton pendingLabel="Abrindo...">Revelar</SubmitButton>
        </form>
      )}

      <div className="mt-4 flex items-center gap-4 border-t border-[rgba(180,144,84,0.18)] pt-3">
        <details className="flex-1">
          <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-sm font-medium text-[#9C6C3C] hover:text-[#2B2620]">
            <Pencil size={15} /> Reescrever
          </summary>
          <div className="mt-3">
            <VowForm action={updateVow} initial={{ id: vow.id, title: vow.title }} />
          </div>
        </details>
        <form action={deleteVow}>
          <input type="hidden" name="id" value={vow.id} />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#8a7b63] hover:text-rose-600"
          >
            <Trash2 size={15} /> Excluir
          </button>
        </form>
      </div>
    </Card>
  );
}
