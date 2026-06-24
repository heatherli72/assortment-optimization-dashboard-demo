import { describe, expect, test } from "vitest";
import { getFgSkuAction, getPlvSkuAction } from "./actions";
import { buildParetoRows, summarizeCoreTail } from "./aggregations";
import { filterProducts } from "./filters";
import { formatMetric, percent } from "./formatters";
import { mockFgSkus, mockPlvSkus, mockProducts } from "../data/mockData";
import { defaultFilters } from "./filters";

describe("analytics helpers", () => {
  test("formats currency metrics", () => {
    expect(formatMetric(1200000, "currency")).toContain("$");
  });

  test("filters products by brand, category, and lifecycle", () => {
    const rows = filterProducts(mockProducts, {
      ...defaultFilters,
      brand: ["Aurora"],
      category: ["Cream"],
      lifecycle: ["Tail"],
    });

    expect(rows.map((row) => row.productLvl1)).toEqual(["Repair Cream"]);
  });

  test("formats percentages with one decimal place", () => {
    expect(percent.format(0)).toBe("0.0%");
    expect(percent.format(0.126)).toBe("12.6%");
  });

  test("builds descending pareto rows with cumulative contribution", () => {
    const rows = buildParetoRows(mockProducts, "value");

    expect(rows[0].value).toBeGreaterThanOrEqual(rows[1].value);
    expect(rows.at(-1)?.cumulativeContribution).toBeCloseTo(1);
  });

  test("summarizes core and tail segments", () => {
    const summary = summarizeCoreTail(mockProducts, "value");

    expect(summary.totalProductCount).toBe(mockProducts.length);
    expect(summary.aCount + summary.bCount + summary.cCount).toBe(mockProducts.length);
  });

  test("keeps high-contribution FG SKUs with an empty reason", () => {
    const product = mockProducts.find((row) => row.id === "p-serum-core");
    const sku = mockFgSkus.find((row) => row.id === "fg-serum-core-30");

    expect(product && sku).toBeTruthy();
    expect(getFgSkuAction(sku!, product!)).toEqual({ action: "Keep", reason: "" });
  });

  test("simplifies low-contribution complex FG SKUs", () => {
    const product = mockProducts.find((row) => row.id === "p-balm-tail-overlap");
    const sku = mockFgSkus.find((row) => row.id === "fg-balm-tail-30");

    expect(product && sku).toBeTruthy();
    expect(getFgSkuAction(sku!, product!).action).toBe("Simplify");
    expect(getFgSkuAction(sku!, product!).reason).not.toHaveLength(0);
  });

  test("simplifies overlapping low-unit PLV SKUs", () => {
    const product = mockProducts.find((row) => row.id === "p-balm-tail-overlap");
    const siblings = mockPlvSkus.filter((row) => row.productId === product?.id);
    const sku = siblings.find((row) => row.id === "plv-balm-tail-deluxe");

    expect(product && sku).toBeTruthy();
    const recommendation = getPlvSkuAction(sku!, product!, siblings);
    expect(recommendation.action).toBe("Simplify");
    expect(recommendation.reason).not.toHaveLength(0);
  });
});
