export type DashboardPageId =
  | "overview"
  | "core-tail"
  | "fg-variety"
  | "fg-sku-deep-dive"
  | "plv-support"
  | "sample-complexity"
  | "plv-sku-deep-dive";

export type MetricKey = "value" | "units" | "indicativeGm";
export type VarietyMetric = "skuCount" | "flaCount";
export type ActionStatus = "Keep" | "Review" | "Simplify";
export type Lifecycle = string;
export type AbcCategory = "A" | "B" | "C";

export interface FilterState {
  timePeriod: string[];
  channelLvl1: string[];
  brand: string[];
  category: string[];
  lifecycle: string[];
  abcCategory: AbcCategory[];
  productSearch: string;
}

export interface ProductRecord {
  id: string;
  timePeriod: string;
  brand: string;
  category: string;
  productLvl1: string;
  lifecycle: Lifecycle;
  abcCategory: AbcCategory;
  channelLvl1: string;
  value: number;
  units: number;
  indicativeGm: number;
  indicativeGmPct: number | null;
  rsp: number;
  map: number;
  skuCount: number;
  flaCount: number;
  plvSkuCount: number;
  plvFlaCount: number;
  plvUnits: number;
  plvCost: number;
  totalProductUnits: number;
  totalProductCost: number;
  plvChannelCoverageCount: number;
}

export interface FgSkuRecord {
  id: string;
  productId: string;
  timePeriod: string;
  channelLvl1: string;
  skuCode: string;
  skuName: string;
  size: string;
  flaCount: number;
  fla: string;
  value: number;
  units: number;
  indicativeGm: number;
  indicativeGmPct: number | null;
  rsp: number;
  map: number;
  cogsPerMlKg: number;
  lifecycle: Lifecycle;
}

export interface PlvSkuRecord {
  id: string;
  productId: string;
  timePeriod: string;
  channelLvl1: string;
  skuCode: string;
  skuName: string;
  size: string;
  flaCount: number;
  fla: string;
  units: number;
  cost: number;
  cogsPerMlKg: number;
  lifecycle: Lifecycle;
  channelLvl2Covered: string[];
  channelCovered: string[];
  sampleType: string;
}

export interface DashboardPageMeta {
  id: DashboardPageId;
  title: string;
  group: "Overview" | "Product (FG)" | "Sample (PLV)";
  level?: "Level 1: Macro" | "Level 2: Diagnosis" | "Level 3: Micro";
  strategicQuestion?: string;
  description: string;
}
