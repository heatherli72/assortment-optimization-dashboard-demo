import type { FgSkuRecord, FilterState, PlvSkuRecord, ProductRecord } from "../domain/types";

export const defaultFilters: FilterState = {
  timePeriod: "All",
  channelLvl1: "All",
  brand: "All",
  category: "All",
  lifecycle: "All",
  abcCategory: "All",
  productSearch: "",
};

const matchesSearch = (value: string, search: string) =>
  value.toLowerCase().includes(search.trim().toLowerCase());

export function filterProducts(products: ProductRecord[], filters: FilterState) {
  return products.filter((product) => {
    if (filters.timePeriod !== "All" && product.timePeriod !== filters.timePeriod) return false;
    if (filters.channelLvl1 !== "All" && product.channelLvl1 !== filters.channelLvl1) return false;
    if (filters.brand !== "All" && product.brand !== filters.brand) return false;
    if (filters.category !== "All" && product.category !== filters.category) return false;
    if (filters.lifecycle !== "All" && product.lifecycle !== filters.lifecycle) return false;
    if (filters.abcCategory !== "All" && product.abcCategory !== filters.abcCategory) return false;
    if (filters.productSearch.trim()) {
      return matchesSearch(product.productLvl1, filters.productSearch);
    }
    return true;
  });
}

export function filterFgSkus(
  skus: FgSkuRecord[],
  products: ProductRecord[],
  filters: FilterState,
) {
  const productIds = new Set(filterProducts(products, filters).map((product) => product.id));
  return skus.filter((sku) => {
    if (!productIds.has(sku.productId)) return false;
    if (filters.timePeriod !== "All" && sku.timePeriod !== filters.timePeriod) return false;
    if (filters.channelLvl1 !== "All" && sku.channelLvl1 !== filters.channelLvl1) return false;
    return true;
  });
}

export function filterPlvSkus(
  skus: PlvSkuRecord[],
  products: ProductRecord[],
  filters: FilterState,
) {
  const productIds = new Set(filterProducts(products, filters).map((product) => product.id));
  return skus.filter((sku) => {
    if (!productIds.has(sku.productId)) return false;
    if (filters.timePeriod !== "All" && sku.timePeriod !== filters.timePeriod) return false;
    if (filters.channelLvl1 !== "All" && sku.channelLvl1 !== filters.channelLvl1) return false;
    return true;
  });
}

export const uniqueValues = <T,>(rows: T[], read: (row: T) => string) =>
  Array.from(new Set(rows.map(read))).sort((a, b) => a.localeCompare(b));
