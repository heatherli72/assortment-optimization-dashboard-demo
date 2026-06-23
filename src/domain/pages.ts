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
      "Identify where the portfolio makes money and where long-tail complexity starts.",
  },
  {
    id: "fg-variety",
    title: "FG Variety vs. Value",
    group: "Product (FG)",
    level: "Level 2: Diagnosis",
    strategicQuestion: "Is Complexity Justified?",
    description:
      "Find products where FG SKU or FLA breadth is not justified by value, units, or margin.",
  },
  {
    id: "fg-sku-deep-dive",
    title: "FG SKU Deep Dive",
    group: "Product (FG)",
    level: "Level 3: Micro",
    strategicQuestion: "What Should We Keep, Review, or Simplify?",
    description:
      "Identify which FG SKUs to keep, review, or simplify inside a selected Product L1.",
  },
  {
    id: "plv-support",
    title: "PLV Support vs. FG Sales",
    group: "Sample (PLV)",
    level: "Level 1: Macro",
    strategicQuestion: "Where is the Money?",
    description:
      "Check whether PLV support is proportionate to the FG sales and demand it supports.",
  },
  {
    id: "sample-complexity",
    title: "PLV Complexity vs. Demand",
    group: "Sample (PLV)",
    level: "Level 2: Diagnosis",
    strategicQuestion: "Is Complexity Justified?",
    description:
      "Expose complex PLV mini-assortments where variety or coverage is not matched by demand.",
  },
  {
    id: "plv-sku-deep-dive",
    title: "PLV SKU Deep Dive",
    group: "Sample (PLV)",
    level: "Level 3: Micro",
    strategicQuestion: "What Should We Keep, Review, or Simplify?",
    description:
      "Identify overlapping, costly, or low-demand PLV SKUs inside a selected Product L1.",
  },
];
