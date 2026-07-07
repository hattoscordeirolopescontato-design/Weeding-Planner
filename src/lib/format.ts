export function formatCurrency(value?: number | null): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Converte para Date SEM cair no fuso: uma string "YYYY-MM-DD" é tratada como
 * data LOCAL (não UTC), evitando o bug de aparecer no dia anterior.
 * Strings com hora (ISO completo, ex.: created_at) mantêm o comportamento normal.
 */
function parseLocal(date: Date | string): Date {
  if (date instanceof Date) return date;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return new Date(date);
}

export function formatDate(date?: Date | string | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(
    parseLocal(date),
  );
}

/** Dias restantes até a data (ou null se sem data / já passou). */
export function daysUntil(date?: Date | string | null): number | null {
  if (!date) return null;
  const target = parseLocal(date);
  const now = new Date();
  // Compara apenas as datas (zera as horas) para uma contagem em dias inteiros.
  const startTarget = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
  ).getTime();
  const startToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const diffDays = Math.round((startTarget - startToday) / (1000 * 60 * 60 * 24));
  return diffDays < 0 ? null : diffDays;
}
