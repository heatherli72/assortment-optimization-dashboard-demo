import { dashboardPages } from "../domain/pages";
import { mockFgSkus, mockPlvSkus, mockProducts } from "./mockData";

test("mock data contains enough products for dashboard scatter charts", () => {
  expect(mockProducts.length).toBeGreaterThanOrEqual(12);
  expect(mockFgSkus.length).toBeGreaterThanOrEqual(36);
  expect(mockPlvSkus.length).toBeGreaterThanOrEqual(24);
});

test("dashboard pages expose the full navigation contract", () => {
  expect(dashboardPages.map((page) => page.id)).toEqual([
    "overview",
    "core-tail",
    "fg-variety",
    "fg-sku-deep-dive",
    "plv-support",
    "sample-complexity",
    "plv-sku-deep-dive",
  ]);

  for (const page of dashboardPages) {
    expect(page.title).not.toHaveLength(0);
    expect(page.description).not.toHaveLength(0);
  }
});

test("each product has required numeric business measures", () => {
  for (const product of mockProducts) {
    expect(product.timePeriod).toMatch(/^2026 (R\d{2}|Q[1-4])$/);
    expect(product.value).toBeGreaterThan(0);
    expect(product.units).toBeGreaterThan(0);
    expect(product.totalProductUnits).toBeGreaterThanOrEqual(product.units);
    expect(product.skuCount).toBeGreaterThan(0);
    expect(product.flaCount).toBeGreaterThan(0);
  }
});

test("deep dive mock data links to valid products", () => {
  const productIds = new Set(mockProducts.map((product) => product.id));

  for (const sku of mockFgSkus) {
    expect(productIds.has(sku.productId)).toBe(true);
    expect(sku.timePeriod).toMatch(/^2026 (R\d{2}|Q[1-4])$/);
    expect(sku.channelLvl1).not.toHaveLength(0);
  }

  for (const sku of mockPlvSkus) {
    expect(productIds.has(sku.productId)).toBe(true);
    expect(sku.timePeriod).toMatch(/^2026 (R\d{2}|Q[1-4])$/);
    expect(sku.channelLvl1).not.toHaveLength(0);
    expect(sku.channelLvl2Covered.length).toBeGreaterThan(0);
    expect(new Set(sku.channelLvl2Covered).size).toBe(sku.channelLvl2Covered.length);
  }
});

test("product plv channel coverage counts are derivable from plv sku lvl2 coverage", () => {
  for (const product of mockProducts) {
    const coverage = new Set(
      mockPlvSkus
        .filter((sku) => sku.productId === product.id)
        .flatMap((sku) => sku.channelLvl2Covered),
    );

    expect(product.plvChannelCoverageCount).toBe(coverage.size);
  }
});
