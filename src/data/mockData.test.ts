import { dashboardPages } from "../domain/pages";
import { mockFgSkus, mockPlvSkus, mockProducts } from "./mockData";

const explicitPlvChannelLvl2Labels = new Set([
  "Retail - Flagship",
  "Retail - Counter",
  "Online - Brand.com",
  "Online - Marketplace",
  "Wholesale - Salon",
  "Wholesale - Distributor",
  "Department Store - Beauty Floor",
  "Travel Retail - Airport",
]);

const deriveChannelLvl1 = (label: string) => label.split(" - ")[0];

test("mock data contains enough products for dashboard scatter charts", () => {
  expect(mockProducts.length).toBeGreaterThanOrEqual(12);
  expect(mockFgSkus.length).toBeGreaterThanOrEqual(36);
  expect(mockPlvSkus.length).toBeGreaterThanOrEqual(24);
});

test("dashboard pages expose the full navigation contract", () => {
  expect(
    dashboardPages.map(({ id, title, group, level, strategicQuestion }) => ({
      id,
      title,
      group,
      ...(level ? { level } : {}),
      ...(strategicQuestion ? { strategicQuestion } : {}),
    })),
  ).toEqual([
    {
      id: "overview",
      title: "Overview",
      group: "Overview",
    },
    {
      id: "core-tail",
      title: "Core vs. Tail",
      group: "Product (FG)",
      level: "Level 1: Macro",
      strategicQuestion: "Where is the Money?",
    },
    {
      id: "fg-variety",
      title: "FG Variety vs. Value",
      group: "Product (FG)",
      level: "Level 2: Diagnosis",
      strategicQuestion: "Is Complexity Justified?",
    },
    {
      id: "fg-sku-deep-dive",
      title: "FG SKU Deep Dive",
      group: "Product (FG)",
      level: "Level 3: Micro",
      strategicQuestion: "What Should We Keep, Review, or Simplify?",
    },
    {
      id: "plv-support",
      title: "PLV Support vs. FG Sales",
      group: "Sample (PLV)",
      level: "Level 1: Macro",
      strategicQuestion: "Where is the Money?",
    },
    {
      id: "sample-complexity",
      title: "Sample Complexity vs. Demand",
      group: "Sample (PLV)",
      level: "Level 2: Diagnosis",
      strategicQuestion: "Is Complexity Justified?",
    },
    {
      id: "plv-sku-deep-dive",
      title: "PLV SKU Deep Dive",
      group: "Sample (PLV)",
      level: "Level 3: Micro",
      strategicQuestion: "What Should We Keep, Review, or Simplify?",
    },
  ]);
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
    expect(sku.channelLvl2Covered.every((label) => explicitPlvChannelLvl2Labels.has(label))).toBe(
      true,
    );
    expect(sku.channelLvl2Covered.every((label) => label.includes(" - "))).toBe(true);
    expect(new Set(sku.channelLvl2Covered.map(deriveChannelLvl1))).toEqual(new Set(sku.channelCovered));
    expect(sku.channelCovered.every((label) => !label.includes(" - "))).toBe(true);
  }
});

test("product plv channel coverage counts are derivable from plv sku lvl2 coverage", () => {
  for (const product of mockProducts) {
    const coverage = new Set(
      mockPlvSkus
        .filter((sku) => sku.productId === product.id)
        .flatMap((sku) => sku.channelLvl2Covered.map(deriveChannelLvl1)),
    );

    expect(product.plvChannelCoverageCount).toBe(coverage.size);
  }
});
