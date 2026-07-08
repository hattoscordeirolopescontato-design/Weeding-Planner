import { Badge } from "@/components/ui";

// Pagamento desativado por enquanto (Stripe removido; Pagar.me será integrado
// depois). Sem cobrança ativa, o acesso fica liberado.
export function SubscriptionSection() {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-[#6B5F4F]">Status:</span>
        <Badge tone="gold">Acesso liberado</Badge>
      </div>
      <p className="mt-2 text-sm text-[#8a7b63]">
        O meio de pagamento está em configuração. Por enquanto o app está liberado
        gratuitamente — nenhuma assinatura é necessária.
      </p>
    </div>
  );
}
