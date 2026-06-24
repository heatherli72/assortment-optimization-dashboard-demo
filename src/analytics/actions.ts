import type { ActionStatus, FgSkuRecord, PlvSkuRecord } from "../domain/types";

export interface ActionRecommendation {
  action: ActionStatus;
  reason: string;
}

const comparableGmPct = (value: number | null) => value ?? Number.NEGATIVE_INFINITY;
const isTailLifecycle = (lifecycle: string) => /tail|end of life|dead/i.test(lifecycle);

export function getFgSkuAction(
  sku: FgSkuRecord,
  productTotals: { value: number; units: number; indicativeGm: number },
): ActionRecommendation {
  const valueShare = productTotals.value ? sku.value / productTotals.value : 0;
  const unitsShare = productTotals.units ? sku.units / productTotals.units : 0;
  const gmShare = productTotals.indicativeGm ? sku.indicativeGm / productTotals.indicativeGm : 0;
  const gmPct = comparableGmPct(sku.indicativeGmPct);

  const lowContribution = unitsShare < 0.05 && valueShare < 0.05;
  const costlyOrComplex = gmPct < 0.25 || sku.cogsPerMlKg > 1.2 || sku.flaCount >= 4;
  const tailComplexity = isTailLifecycle(sku.lifecycle) && costlyOrComplex && unitsShare < 0.35;

  if ((lowContribution && costlyOrComplex) || tailComplexity) {
    return {
      action: "Simplify",
      reason: sku.flaCount >= 4 ? "High FLA burden" : "Low units contribution",
    };
  }

  if ((valueShare >= 0.2 || unitsShare >= 0.2 || gmShare >= 0.2) && gmPct >= 0.25 && sku.cogsPerMlKg <= 1.2) {
    return { action: "Keep", reason: "" };
  }

  return { action: "Review", reason: "Mixed performance signals" };
}

export function getPlvSkuAction(
  sku: PlvSkuRecord,
  productTotals: { plvUnits: number },
  siblingSkus: PlvSkuRecord[],
): ActionRecommendation {
  const unitsShare = productTotals.plvUnits ? sku.units / productTotals.plvUnits : 0;
  const overlappingRole = siblingSkus.some(
    (other) => other.id !== sku.id && other.size === sku.size && other.sampleType === sku.sampleType,
  );

  if (unitsShare >= 0.25 && sku.cogsPerMlKg <= 0.6 && !overlappingRole) {
    return { action: "Keep", reason: "" };
  }

  const tailSampleBurden = isTailLifecycle(sku.lifecycle) && sku.cogsPerMlKg > 0.8 && sku.flaCount >= 4 && unitsShare < 0.35;

  if (
    (unitsShare < 0.08 && (sku.cogsPerMlKg > 0.8 || overlappingRole || sku.channelCovered.length <= 1)) ||
    tailSampleBurden
  ) {
    return {
      action: "Simplify",
      reason: overlappingRole ? "Overlapping sample role" : "Low PLV units",
    };
  }

  return { action: "Review", reason: "Mixed demand and cost signals" };
}
