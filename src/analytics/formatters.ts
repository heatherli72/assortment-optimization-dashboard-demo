export const compactNumber = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export const wholeNumber = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

export const percent = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatNullablePercent(value: number | null | undefined) {
  return value == null ? "N/A" : percent.format(value);
}

export function formatMetric(
  value: number,
  kind: "number" | "currency" | "percent" = "number",
) {
  if (kind === "currency") return currency.format(value);
  if (kind === "percent") return percent.format(value);
  return compactNumber.format(value);
}
