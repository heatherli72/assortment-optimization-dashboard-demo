import type { FgSkuRecord, FilterState, PlvSkuRecord, ProductRecord } from "../domain/types";

export const defaultFilters: FilterState = {
  timePeriod: [],
  channelLvl1: [],
  brand: [],
  category: [],
  lifecycle: [],
  abcCategory: [],
  productSearch: "",
};

const matchesSearch = (value: string, search: string) =>
  value.toLowerCase().includes(search.trim().toLowerCase());
const matchesSelection = (selection: string[], value: string) => selection.length === 0 || selection.includes(value);

export function filterProducts(products: ProductRecord[], filters: FilterState) {
  return products.filter((product) => {
    if (!matchesSelection(filters.timePeriod, product.timePeriod)) return false;
    if (!matchesSelection(filters.channelLvl1, product.channelLvl1)) return false;
    if (!matchesSelection(filters.brand, product.brand)) return false;
    if (!matchesSelection(filters.category, product.category)) return false;
    if (!matchesSelection(filters.lifecycle, product.lifecycle)) return false;
    if (!matchesSelection(filters.abcCategory, product.abcCategory)) return false;
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
  const productIds = new Set(filterProducts(products, { ...filters, lifecycle: [] }).map((product) => product.id));
  return skus.filter((sku) => {
    if (!productIds.has(sku.productId)) return false;
    if (!matchesSelection(filters.timePeriod, sku.timePeriod)) return false;
    if (!matchesSelection(filters.channelLvl1, sku.channelLvl1)) return false;
    if (!matchesSelection(filters.lifecycle, sku.lifecycle)) return false;
    return true;
  });
}

export function filterPlvSkus(
  skus: PlvSkuRecord[],
  products: ProductRecord[],
  filters: FilterState,
) {
  const productIds = new Set(filterProducts(products, { ...filters, lifecycle: [] }).map((product) => product.id));
  return skus.filter((sku) => {
    if (!productIds.has(sku.productId)) return false;
    if (!matchesSelection(filters.timePeriod, sku.timePeriod)) return false;
    if (!matchesSelection(filters.channelLvl1, sku.channelLvl1)) return false;
    if (!matchesSelection(filters.lifecycle, sku.lifecycle)) return false;
    return true;
  });
}

export const uniqueValues = <T,>(rows: T[], read: (row: T) => string) =>
  Array.from(new Set(rows.map(read))).sort((a, b) => a.localeCompare(b));
