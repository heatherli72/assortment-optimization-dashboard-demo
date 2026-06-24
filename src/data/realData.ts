import payload from "./realData.json";
import type { FgSkuRecord, PlvSkuRecord, ProductRecord } from "../domain/types";

interface RealDataPayload {
  metadata: {
    generatedAt: string;
    sourceRunDir: string;
    scope: string;
    productRows: number;
    fgSkuRows: number;
    plvSkuRows: number;
    metricRules: string[];
  };
  products: ProductRecord[];
  fgSkus: FgSkuRecord[];
  plvSkus: PlvSkuRecord[];
}

const realData = payload as RealDataPayload;

const normalizeDeclaredSize = (size: string) => {
  const match = size.match(/^(-?\d+(?:\.\d+)?)[A-Z]+$/);
  return match ? Number(match[1]).toFixed(1) : size;
};

export const realDataMetadata = realData.metadata;
export const realProducts = realData.products;
export const realFgSkus = realData.fgSkus.map((sku) => ({ ...sku, size: normalizeDeclaredSize(sku.size) }));
export const realPlvSkus = realData.plvSkus.map((sku) => ({ ...sku, size: normalizeDeclaredSize(sku.size) }));
