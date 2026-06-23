import type { MetricKey, ProductRecord, VarietyMetric } from "../domain/types";

export interface ParetoRow {
  id: string;
  label: string;
  value: number;
  contribution: number;
  cumulativeContribution: number;
  segment: "A" | "B" | "C";
}

export function getProductMetric(product: ProductRecord, metric: MetricKey) {
  if (metric === "units") return product.units;
  if (metric === "indicativeGm") return product.indicativeGm;
  return product.value;
}

export function getMetricLabel(metric: MetricKey) {
  if (metric === "units") return "Units";
  if (metric === "indicativeGm") return "Indicative GM";
  return "Value";
}

export function getMetricKind(metric: MetricKey): "number" | "currency" {
  return metric === "units" ? "number" : "currency";
}

export function getVarietyLabel(metric: VarietyMetric) {
  return metric === "flaCount" ? "FLA Count" : "SKU Count";
}

export function buildParetoRows(products: ProductRecord[], metric: MetricKey): ParetoRow[] {
  const sorted = [...products].sort((a, b) => getProductMetric(b, metric) - getProductMetric(a, metric));
  const total = sorted.reduce((sum, product) => sum + getProductMetric(product, metric), 0);
  let cumulative = 0;
  return sorted.map((product) => {
    const value = getProductMetric(product, metric);
    const contribution = total === 0 ? 0 : value / total;
    const segment = cumulative < 0.6 ? "A" : cumulative < 0.9 ? "B" : "C";
    cumulative += contribution;
    return {
      id: product.id,
      label: product.productLvl1,
      value,
      contribution,
      cumulativeContribution: Math.min(cumulative, 1),
      segment,
    };
  });
}

export function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

export function summarizeCoreTail(products: ProductRecord[], metric: MetricKey) {
  const rows = buildParetoRows(products, metric);
  const bySegment = (segment: "A" | "B" | "C") => rows.filter((row) => row.segment === segment);
  return {
    totalProductCount: products.length,
    aCount: bySegment("A").length,
    bCount: bySegment("B").length,
    cCount: bySegment("C").length,
    aPct: products.length ? bySegment("A").length / products.length : 0,
    bPct: products.length ? bySegment("B").length / products.length : 0,
    cPct: products.length ? bySegment("C").length / products.length : 0,
  };
}

export function summarizeFgVariety(products: ProductRecord[]) {
  return {
    totalProductCount: products.length,
    avgSkuCount: average(products.map((product) => product.skuCount)),
    avgFlaCount: average(products.map((product) => product.flaCount)),
  };
}

export function summarizePlvSupport(products: ProductRecord[]) {
  return {
    totalProductCount: products.length,
    productWithPlvCount: products.filter((product) => product.plvSkuCount > 0).length,
    totalPlvSkuCount: products.reduce((sum, product) => sum + product.plvSkuCount, 0),
    totalPlvUnits: products.reduce((sum, product) => sum + product.plvUnits, 0),
    totalPlvCost: products.reduce((sum, product) => sum + product.plvCost, 0),
  };
}

export function summarizeSampleComplexity(products: ProductRecord[]) {
  const withPlv = products.filter((product) => product.plvSkuCount > 0);
  return {
    totalProductCount: products.length,
    productWithPlvCount: withPlv.length,
    avgPlvSkuCount: average(withPlv.map((product) => product.plvSkuCount)),
    avgPlvFlaCount: average(withPlv.map((product) => product.plvFlaCount)),
  };
}

export function productContribution(product: ProductRecord, products: ProductRecord[], metric: MetricKey) {
  const total = products.reduce((sum, row) => sum + getProductMetric(row, metric), 0);
  return total ? getProductMetric(product, metric) / total : 0;
}
