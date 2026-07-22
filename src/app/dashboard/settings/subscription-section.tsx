import Link from "next/link";
import { Badge } from "@/components/ui";
import { CancelSubscriptionButton } from "./cancel-subscription-button";

type Pedido = {
  status: string;
  valor: number;
  created_at: string;
} | null;

const STATUS_LABEL: Record<string, { label: string; tone: "green" | "amber" | "rose" }> = {
  paid: { label: "Pago", tone: "green" },
  pending: { label: "Em análise", tone: "amber" },
  processing: { label: "Em análise", tone: "amber" },
  failed: { label: "Recusado", tone: "rose" },
  canceled: { label: "Cancelado", tone: "rose" },
  refunded: { label: "Estornado", tone: "rose" },
};

export function SubscriptionSection({
  pedido,
  canceladoEm,
  validoAte,
  periodoExpirado,
}: {
  pedido: Pedido;
  canceladoEm: string | null;
  validoAte: string | null;
  periodoExpirado: boolean;
}) {
  if (!pedido) {
    return (
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#6B5F4F]">Status:</span>
          <Badge tone="stone">Sem assinatura</Badge>
        </div>
        <p className="mt-2 text-sm text-[#8a7b63]">
          Você ainda não tem nenhum pagamento registrado.{" "}
          <Link href="/assinar" className="font-bold text-[#9C6C3C] hover:underline">
            Assinar agora
          </Link>
          .
        </p>
      </div>
    );
  }

  if (canceladoEm) {
    return (
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#6B5F4F]">Status:</span>
          <Badge tone="rose">Cancelada</Badge>
        </div>
        <p className="mt-2 text-sm text-[#8a7b63]">
          Cancelada em {new Date(canceladoEm).toLocaleDateString("pt-BR")}. Seus dados
          continuam salvos, mas o painel fica travado para edição até reativar.
        </p>
        <Link href="/assinar" className="mt-2 inline-block text-sm font-bold text-[#9C6C3C] hover:underline">
          Reativar assinatura
        </Link>
      </div>
    );
  }

  // periodoExpirado só é true quando existiu um pagamento aprovado
  // (ultimoPago) que já venceu — vale mesmo se a tentativa mais recente
  // (pedido) for uma renovação que falhou depois disso.
  if (periodoExpirado) {
    return (
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#6B5F4F]">Status:</span>
          <Badge tone="amber">Expirada</Badge>
        </div>
        <p className="mt-2 text-sm text-[#8a7b63]">
          Seu período pago venceu em {validoAte && new Date(validoAte).toLocaleDateString("pt-BR")}
          . Seus dados continuam salvos, mas o painel fica travado para edição até renovar.
        </p>
        <Link href="/assinar" className="mt-2 inline-block text-sm font-bold text-[#9C6C3C] hover:underline">
          Renovar assinatura
        </Link>
      </div>
    );
  }

  const info = STATUS_LABEL[pedido.status] ?? { label: pedido.status, tone: "stone" as const };

  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-[#6B5F4F]">Status:</span>
        <Badge tone={info.tone}>{info.label}</Badge>
      </div>
      <p className="mt-2 text-sm text-[#8a7b63]">
        Último pagamento: R$ {pedido.valor.toFixed(2).replace(".", ",")} em{" "}
        {new Date(pedido.created_at).toLocaleDateString("pt-BR")}.
        {pedido.status === "paid" && validoAte && (
          <> Válido até {new Date(validoAte).toLocaleDateString("pt-BR")}.</>
        )}
      </p>
      {pedido.status !== "paid" && (
        <Link href="/assinar" className="mt-2 inline-block text-sm font-bold text-[#9C6C3C] hover:underline">
          Tentar novamente
        </Link>
      )}
      {pedido.status === "paid" && <CancelSubscriptionButton />}
    </div>
  );
}
