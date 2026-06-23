import type { DashboardPageMeta } from "./types";

export const dashboardPages: DashboardPageMeta[] = [
  {
    id: "overview",
    title: "Overview",
    group: "Overview",
    description: "Navigate the assortment optimization analytics framework.",
  },
  {
    id: "core-tail",
    title: "Core vs. Tail",
    group: "Product (FG)",
    level: "Level 1: Macro",
    strategicQuestion: "Where is the Money?",
    description:
      "Separate top value drivers from the low-performing long tail across the portfolio.",
  },
  {
    id: "fg-variety",
    title: "FG Variety vs. Value",
    group: "Product (FG)",
    level: "Level 2: Diagnosis",
    strategicQuestion: "Is Complexity Justified?",
    description:
      "Flag products where high SKU and FLA variety fail to generate enough value.",
  },
  {
    id: "fg-sku-deep-dive",
    title: "FG SKU Deep Dive",
    group: "Product (FG)",
    level: "Level 3: Micro",
    strategicQuestion: "What Should We Keep, Review, or Simplify?",
    description:
      "Zoom into one product to identify low-volume, low-margin, or high-complexity SKUs.",
  },
  {
    id: "plv-support",
    title: "PLV Support vs. FG Sales",
    group: "Sample (PLV)",
    level: "Level 1: Macro",
    strategicQuestion: "Where is the Money?",
    description:
      "Check whether PLV support is proportionate to FG sales and units.",
  },
  {
    id: "sample-complexity",
    title: "Sample Complexity vs. Demand",
    group: "Sample (PLV)",
    level: "Level 2: Diagnosis",
    strategicQuestion: "Is Complexity Justified?",
    description:
      "Expose complex mini-assortments that lack shipped units to justify their existence.",
  },
  {
    id: "plv-sku-deep-dive",
    title: "PLV SKU Deep Dive",
    group: "Sample (PLV)",
    level: "Level 3: Micro",
    strategicQuestion: "What Should We Keep, Review, or Simplify?",
    description:
      "Zoom into one product to identify overlapping PLV sizes with no distinct sales role.",
  },
];
