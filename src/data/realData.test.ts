import { realDataMetadata, realFgSkus, realPlvSkus, realProducts } from "./realData";

test("real dashboard data is generated from the Sell-in workbook outputs", () => {
  expect(realProducts).toHaveLength(realDataMetadata.productRows);
  expect(realFgSkus).toHaveLength(realDataMetadata.fgSkuRows);
  expect(realPlvSkus).toHaveLength(realDataMetadata.plvSkuRows);
  expect(realProducts.length).toBeGreaterThan(1000);
  expect(realFgSkus.length).toBeGreaterThan(1000);
  expect(realPlvSkus.length).toBeGreaterThan(1000);
});

test("real dashboard data uses the current full-scope time and channel grain", () => {
  expect(new Set(realProducts.map((row) => row.timePeriod))).toEqual(new Set(["All"]));
  expect(new Set(realProducts.map((row) => row.channelLvl1))).toEqual(new Set(["All"]));
});

test("real dashboard data is not the demo mock assortment", () => {
  expect(realProducts.some((row) => row.brand === "Aurora")).toBe(false);
  expect(realProducts.some((row) => row.productLvl1 === "黑绷带50px")).toBe(true);
});

test("SKU size is based on declared content instead of SKU format text", () => {
  const sku = realFgSkus.find((row) => row.skuCode === "LE916100");
  expect(sku?.size).toBe("50.0");
});
