"use client";

import { useActionState, useEffect, useRef } from "react";
import { Field, Input, Textarea } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import type { FormState } from "@/lib/validation";

export function VowForm({
  action,
  initial,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  initial?: { id: string; title: string };
}) {
  const [state, formAction] = useActionState(action, undefined);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok && !initial) ref.current?.reset();
  }, [state, initial]);

  return (
    <form ref={ref} action={formAction} className="flex flex-col gap-4">
      {initial && <input type="hidden" name="id" value={initial.id} />}

      <Field label="Título" htmlFor="vow-title" error={state?.errors?.title}>
        <Input
          id="vow-title"
          name="title"
          defaultValue={initial?.title ?? "Meus votos"}
          required
        />
      </Field>

      <Field
        label="Seus votos"
        htmlFor="vow-content"
        error={state?.errors?.content}
        hint={
          initial
            ? "O texto será cifrado novamente com a senha informada."
            : "Escreva com o coração. O texto será cifrado e só você poderá lê-lo com a senha."
        }
      >
        <Textarea
          id="vow-content"
          name="content"
          className="min-h-40"
          placeholder="Desde o dia em que te conheci..."
          required
        />
      </Field>

      <Field
        label={initial ? "Senha (defina novamente)" : "Senha de proteção"}
        htmlFor="vow-password"
        error={state?.errors?.password}
        hint="Guarde-a bem: sem ela, não há como recuperar o texto."
      >
        <Input
          id="vow-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
      </Field>

      <div className="flex items-center gap-3">
        <SubmitButton>{initial ? "Salvar votos" : "Guardar votos"}</SubmitButton>
        {state?.ok && state.message && (
          <span className="text-xs font-medium text-emerald-700">{state.message}</span>
        )}
        {state?.message && !state.ok && (
          <span className="text-xs font-medium text-rose-700">{state.message}</span>
        )}
      </div>
    </form>
  );
}
