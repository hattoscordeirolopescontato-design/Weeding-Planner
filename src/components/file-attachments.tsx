"use client";

import { useRef, useState } from "react";
import { Paperclip, FileText, X } from "lucide-react";
import { formatDate } from "@/lib/format";
import { uid } from "@/lib/use-local-store";
import type { Receipt } from "@/lib/types";

function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, b64] = dataUrl.split(",");
  const mimeMatch = meta.match(/data:(.*?);base64/);
  const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

function isImage(dataUrl: string): boolean {
  return dataUrl.startsWith("data:image/");
}

/** Anexos com upload (base64) + visualização: imagens em modal, PDFs via Object URL. */
export function Attachments({
  receipts,
  onAdd,
  onRemove,
  label = "Comprovantes",
}: {
  receipts: Receipt[];
  onAdd: (r: Receipt) => void;
  onRemove: (id: string) => void;
  label?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<Receipt | null>(null);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        onAdd({
          id: uid(),
          name: file.name,
          dataUrl: String(reader.result),
          uploadedAt: new Date().toISOString(),
        });
      };
      reader.readAsDataURL(file);
    });
    if (fileRef.current) fileRef.current.value = "";
  }

  function open(r: Receipt) {
    if (isImage(r.dataUrl)) {
      setPreview(r);
    } else {
      // PDF / outros: converter base64 -> Blob -> Object URL (evita tela em branco)
      const url = URL.createObjectURL(dataUrlToBlob(r.dataUrl));
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[#33302e]">{label}</p>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#9C6C3C] hover:text-[#7a521e]"
        >
          <Paperclip size={15} /> Anexar
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {receipts.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1.5">
          {receipts.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between rounded-lg bg-[rgba(156,108,60,0.05)] px-3 py-1.5"
            >
              <button
                type="button"
                onClick={() => open(r)}
                className="flex min-w-0 items-center gap-2 text-sm text-[#33302e] hover:text-[#2B2620]"
              >
                <FileText size={15} className="shrink-0" />
                <span className="truncate">{r.name}</span>
                <span className="shrink-0 text-xs text-[#b7a98c]">
                  {formatDate(r.uploadedAt)}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onRemove(r.id)}
                className="text-[#b7a98c] hover:text-rose-600"
                aria-label="Remover anexo"
              >
                <X size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Modal de imagem */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setPreview(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreview(null)}
              className="absolute -right-3 -top-3 rounded-full bg-white/20 p-1.5 text-white backdrop-blur hover:bg-white/30"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview.dataUrl}
              alt={preview.name}
              className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
