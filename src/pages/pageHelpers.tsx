import type { MetricKey, ProductRecord, VarietyMetric } from "../domain/types";
import { currency, formatMetric, percent, wholeNumber } from "../analytics/formatters";
import type { MetricSwitchOption } from "../components/MetricSwitch";

export const metricOptions: Array<MetricSwitchOption<MetricKey>> = [
  { value: "value", label: "Sales Value" },
  { value: "units", label: "Units" },
  { value: "indicativeGm", label: "Indicative GM" },
];

export const varietyOptions: Array<MetricSwitchOption<VarietyMetric>> = [
  { value: "skuCount", label: "SKU Count" },
  { value: "flaCount", label: "FLA Count" },
];

export const metricLabel: Record<MetricKey, string> = {
  value: "Sales Value",
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
    body: [
      "FG only unless a table explicitly references PLV support.",
      "Global filters apply to KPI row, charts, and table.",
      "Product L1 is the Buycoor-maintained product grouping and can include all FG and PLV materials under the product.",
    ],
  },
  {
    heading: "Definitions",
    body: [
      "ABC Type is based on contribution to brand sales unless a page-specific metric selector is active.",
      "SKU = Material, SKU Code = Material Code, and SKU Name = Material Name.",
      "COGS, MAP, and Cost are treated as the same cost concept in this demo.",
      "Product-level Indicative GM = FG Sales Value - FG COGS - PLV/PLS COGS.",
      "SKU Count is the default complexity proxy; FLA Count is available as an alternate view.",
    ],
  },
];

export const fgSkuScopeSections = [
  ...fgScopeSections,
  {
    heading: "Action methodology",
    body: [
      "Suggested action is evaluated within the selected Product L1. It compares each FG SKU against sibling FG SKUs in the same product, not against the whole brand.",
      "Keep means the SKU has strong within-product contribution (at least 20% of value, units, or indicative GM) with acceptable indicative GM% and COGS per ml/kg.",
      "Simplify means the SKU has low within-product value and units contribution plus a cost or complexity burden, or a Tail lifecycle SKU with high burden and low units share.",
      "Review means mixed signals: the SKU is not clearly strong enough for Keep and not clearly weak enough for Simplify. If all SKUs are Review, the product is a borderline portfolio where no SKU crosses the decisive thresholds.",
      "Reason is populated for Review or Simplify to explain the primary trigger; Keep intentionally has no reason.",
    ],
  },
];

export const plvScopeSections = [
  {
    heading: "Scope",
    body: [
      "PLV analysis uses products with sample activity for charts unless noted.",
      "Global filters apply to KPI row, charts, and table.",
      "Product L1 is the Buycoor-maintained product grouping and can include all FG and PLV materials under the product.",
    ],
  },
  {
    heading: "Definitions",
    body: [
      "SKU = Material, SKU Code = Material Code, and SKU Name = Material Name.",
      "Channel L1 and Channel L2 are shown separately where coverage granularity matters.",
      "COGS, MAP, and Cost are treated as the same cost concept in this demo.",
      "Product-level Indicative GM includes PLV/PLS COGS when it appears in FG-facing pages.",
      "PLV Units / Total Product Units is the default support intensity metric.",
    ],
  },
];

export const plvSkuScopeSections = [
  ...plvScopeSections,
  {
    heading: "Action methodology",
    body: [
      "Suggested action is evaluated within the selected Product L1. It compares each PLV SKU against sibling PLV SKUs in the same product.",
      "Keep means the PLV SKU has meaningful within-product PLV units share, acceptable COGS per ml/kg, and no overlapping sample role with the same size and sample type.",
      "Simplify means the PLV SKU has low within-product PLV units share plus high cost, overlapping role, weak channel coverage, or Tail lifecycle sample burden.",
      "Review means mixed demand, cost, or coverage signals. If all PLV SKUs are Review, the product has no clear keep-or-simplify candidate under the current thresholds.",
      "Reason is populated for Review or Simplify to explain the primary trigger; Keep intentionally has no reason.",
    ],
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
