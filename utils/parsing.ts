export function parseQuantity(value: string): number | null {
  const normalized = Number(value.trim().replace(/\s/g, "").replace(/,/g, "."));
  if (!Number.isFinite(normalized) || normalized <= 0 || !Number.isInteger(normalized)) return null;
  return normalized;
}

export function parseCurrency(value: string): number | null {
  const sanitized = value.trim().replace(/\s/g, "").replace(/[^0-9.,]/g, "");
  if (!sanitized) return null;

  const hasComma = sanitized.includes(",");
  const hasDot = sanitized.includes(".");
  let normalized = sanitized;

  if (hasComma && hasDot) {
    normalized = sanitized.replace(/\./g, "").replace(/,/g, ".");
  } else if (hasComma) {
    normalized = sanitized.replace(/,/g, ".");
  } else if ((sanitized.match(/\./g) ?? []).length > 1) {
    const lastDot = sanitized.lastIndexOf(".");
    normalized = sanitized
      .split("")
      .filter((char, index) => char !== "." || index === lastDot)
      .join("");
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}
