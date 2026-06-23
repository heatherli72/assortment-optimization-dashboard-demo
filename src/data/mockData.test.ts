import { mockFgSkus, mockPlvSkus, mockProducts } from "./mockData";

test("mock data contains enough products for dashboard scatter charts", () => {
  expect(mockProducts.length).toBeGreaterThanOrEqual(12);
});

test("each product has required numeric business measures", () => {
  for (const product of mockProducts) {
    expect(product.value).toBeGreaterThan(0);
    expect(product.units).toBeGreaterThan(0);
    expect(product.totalProductUnits).toBeGreaterThanOrEqual(product.units);
    expect(product.skuCount).toBeGreaterThan(0);
    expect(product.flaCount).toBeGreaterThan(0);
  }
});

test("deep dive mock data links to valid products", () => {
  const productIds = new Set(mockProducts.map((product) => product.id));

  for (const sku of [...mockFgSkus, ...mockPlvSkus]) {
    expect(productIds.has(sku.productId)).toBe(true);
  }
});
