"use client";

import { useFormStatus } from "react-dom";
import { btnPrimary } from "@/components/ui";

export function SubmitButton({
  children,
  pendingLabel = "Salvando...",
  className = "",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${btnPrimary} ${className}`}>
      {pending ? pendingLabel : children}
    </button>
  );
}
