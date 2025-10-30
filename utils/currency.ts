export function formatBRL(value: number | null | undefined): string {
  if (value == null) return "-";
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `R$ ${Number(value).toFixed(2).replace(".", ",")}`;
  }
}
