/**
 * Soma 1 mês a uma data, "grudando" no último dia do mês de destino quando
 * o dia de origem não existe nele (ex.: 31 de janeiro + 1 mês = 28/29 de
 * fevereiro, não 3 de março).
 */
export function addOneMonthClamped(date: Date): Date {
  const day = date.getDate();
  const d = new Date(date);
  d.setDate(1);
  d.setMonth(d.getMonth() + 1);
  const lastDayOfTargetMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, lastDayOfTargetMonth));
  return d;
}

/** Cobrança é única (não recorrente): cada pagamento libera 1 mês de acesso. */
export function billingPeriodEndsAt(paidAt: string | Date): Date {
  return addOneMonthClamped(new Date(paidAt));
}
