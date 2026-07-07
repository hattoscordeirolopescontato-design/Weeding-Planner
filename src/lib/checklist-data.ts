import type {
  ChecklistCategory,
  ChecklistItem,
  Responsavel,
} from "@/lib/types";

type SeedItem = { title: string; owner: Responsavel };
type Seed = { category: ChecklistCategory; items: SeedItem[] };

const A: Responsavel = "ambos";
const O: Responsavel = "noivo";
const N: Responsavel = "noiva";

const SEEDS: Seed[] = [
  {
    category: "12 meses antes",
    items: [
      { title: "Definir o orçamento total", owner: A },
      { title: "Escolher a data do casamento", owner: A },
      { title: "Montar a lista inicial de convidados", owner: A },
      { title: "Pesquisar e visitar locais para a cerimônia e festa", owner: A },
      { title: "Reservar o local", owner: A },
      { title: "Contratar o buffet", owner: A },
      { title: "Contratar fotógrafo e filmagem", owner: A },
      { title: "Definir o estilo e tema da decoração", owner: A },
    ],
  },
  {
    category: "6 meses antes",
    items: [
      { title: "Escolher e encomendar o vestido da noiva", owner: N },
      { title: "Agendar provas com a costureira", owner: N },
      { title: "Alugar ou comprar o traje do noivo", owner: O },
      { title: "Contratar a banda ou DJ", owner: A },
      { title: "Contratar a decoração e flores", owner: A },
      { title: "Definir o bolo e os doces", owner: A },
      { title: "Contratar o celebrante", owner: A },
      { title: "Enviar os convites (ou save the date)", owner: A },
      { title: "Montar a lista de presentes", owner: A },
    ],
  },
  {
    category: "1 mês antes",
    items: [
      { title: "Confirmar presença dos convidados (RSVP)", owner: A },
      { title: "Prova final do vestido", owner: N },
      { title: "Prova final do traje", owner: O },
      { title: "Agendar cabelo e maquiagem", owner: N },
      { title: "Definir o cronograma do dia", owner: A },
      { title: "Confirmar todos os fornecedores", owner: A },
      { title: "Organizar o layout das mesas", owner: A },
      { title: "Comprar as alianças", owner: A },
    ],
  },
  {
    category: "Semana do casamento",
    items: [
      { title: "Confirmar horários com todos os fornecedores", owner: A },
      { title: "Separar documentos e alianças", owner: A },
      { title: "Preparar kit de emergência", owner: N },
      { title: "Organizar despedida de solteiro", owner: O },
      { title: "Fazer as malas da lua de mel", owner: A },
      { title: "Pagar saldos pendentes dos fornecedores", owner: A },
      { title: "Descansar e aproveitar o grande dia", owner: A },
    ],
  },
];

export function defaultChecklist(): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  SEEDS.forEach((seed, ci) => {
    seed.items.forEach((item, ti) => {
      items.push({
        id: `def-${ci}-${ti}`,
        category: seed.category,
        title: item.title,
        done: false,
        custom: false,
        owner: item.owner,
      });
    });
  });
  return items;
}

export const CHECKLIST_CATEGORIES: ChecklistCategory[] = [
  "12 meses antes",
  "6 meses antes",
  "1 mês antes",
  "Semana do casamento",
];
