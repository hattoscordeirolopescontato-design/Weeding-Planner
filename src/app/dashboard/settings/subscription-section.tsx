import Link from "next/link";
import { Badge } from "@/components/ui";

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

export function SubscriptionSection({ pedido }: { pedido: Pedido }) {
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
      </p>
      {pedido.status !== "paid" && (
        <Link href="/assinar" className="mt-2 inline-block text-sm font-bold text-[#9C6C3C] hover:underline">
          Tentar novamente
        </Link>
      )}
    </div>
  );
}
