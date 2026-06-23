import type { MetricKey, ProductRecord, VarietyMetric } from "../domain/types";
import { currency, formatMetric, percent, wholeNumber } from "../analytics/formatters";
import type { MetricSwitchOption } from "../components/MetricSwitch";

export const metricOptions: Array<MetricSwitchOption<MetricKey>> = [
  { value: "value", label: "Value" },
  { value: "units", label: "Units" },
  { value: "indicativeGm", label: "Indicative GM" },
];

export const varietyOptions: Array<MetricSwitchOption<VarietyMetric>> = [
  { value: "skuCount", label: "SKU Count" },
  { value: "flaCount", label: "FLA Count" },
];

export const metricLabel: Record<MetricKey, string> = {
  value: "Value",
  units: "Units",
  indicativeGm: "Indicative GM",
};

export const varietyLabel: Record<VarietyMetric, string> = {
  skuCount: "SKU Count",
  flaCount: "FLA Count",
};

export const metricFormatter = (metric: MetricKey) =>
  metric === "units" ? (value: number) => wholeNumber.format(value) : (value: number) => currency.format(value);

export const fgScopeSections = [
  {
    heading: "Scope",
    body: ["FG only.", "Global filters apply to KPI row, charts, and detailed table.", "PDF page 1 data-model note is excluded from dashboard content."],
  },
  {
    heading: "Definitions",
    body: ["ABC Category is based on contribution to brand sales.", "SKU Count is the default complexity proxy; FLA Count is available as an alternate view."],
  },
];

export const plvScopeSections = [
  {
    heading: "Scope",
    body: ["PLV analysis uses products with sample activity for charts unless noted.", "Product count KPI can include all filtered products.", "Channel coverage is modeled at channel lvl2."],
  },
  {
    heading: "Definitions",
    body: ["PLV Units / Total Product Units is the default support intensity metric.", "Suggested action uses Keep, Review, and Simplify; Keep leaves Reason blank."],
  },
];

export function getProductMetricValue(product: ProductRecord, metric: MetricKey) {
  if (metric === "units") return product.units;
  if (metric === "indicativeGm") return product.indicativeGm;
  return product.value;
}

export function formatPercent(value: number) {
  return percent.format(value);
}

export function emptyReason(reason: string) {
  return reason || "\u00a0";
}

export function ratio(numerator: number, denominator: number) {
  return denominator ? numerator / denominator : 0;
}

export function formatRatio(numerator: number, denominator: number) {
  return formatPercent(ratio(numerator, denominator));
}

export function productLabel(product: ProductRecord) {
  return `${product.brand} / ${product.productLvl1}`;
}
