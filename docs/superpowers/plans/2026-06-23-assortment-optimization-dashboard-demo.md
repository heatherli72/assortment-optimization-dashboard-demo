# Assortment Optimization Dashboard Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a desktop-first React dashboard demo for assortment optimization, using mock data to show the framework overview, sticky filters, KPI rows, charts, detailed tables, scope drawers, and keep/review/simplify recommendations.

**Architecture:** Create a Vite + React + TypeScript app in this repository. Keep domain data, analytics calculations, chart primitives, shared dashboard components, and page compositions in separate focused modules. Use CSS design tokens and custom SVG charts so the visual system can match the source PDF without relying on a generic dashboard template.

**Tech Stack:** Vite, React, TypeScript, Vitest, React Testing Library, Playwright, CSS modules/global CSS tokens, custom SVG charts.

## Global Constraints

- Source design spec: `docs/superpowers/specs/2026-06-23-assortment-optimization-dashboard-design.md`.
- Source PDF: `/Users/heather/Downloads/dashboard design working sheet.pdf`.
- Page 1 of the source PDF is only a build-team data-model note and must not appear as dashboard content.
- Overview page uses the simplified analytics framework as the cover page and primary navigation model.
- Global filters are sticky and remain visible while scrolling.
- Global filters: Time period, Channel lvl1, Brand, Category, Product lifecycle.
- Page-specific Product search appears only on FG SKU Deep Dive and PLV SKU Deep Dive.
- Every analytical page follows this order: decision statement, KPI row, primary chart area, detailed table, Scope & definitions drawer.
- Long scope notes belong in a `Scope & definitions` drawer, not as visible page footers.
- Visual language matches the PDF framework page: light canvas, Product (FG) magenta, Strategic Logic purple, Sample (PLV) cyan, and restrained dashboard cards.
- Page 2 chart defaults to x-axis `Value`, y-axis `SKU Count`; `FLA Count` is an alternate y-axis option.
- Page 5 title is `Sample Complexity vs. Demand`.
- Page 4 primary y-axis is `PLV Units / Total Product Units`.
- FG SKU Deep Dive and PLV SKU Deep Dive both use `Suggested action` values `Keep`, `Review`, and `Simplify`.
- `Reason` is required for `Review` and `Simplify`; `Keep` leaves `Reason` empty.
- First demo is mock-data only; real data warehouse connection, authentication, saved views, exports, final consolidated cut list, and approval workflow are out of scope.

---

## File Structure

Create this structure under `/Users/heather/Documents/product analysis`:

```text
package.json
index.html
tsconfig.json
vite.config.ts
vitest.config.ts
playwright.config.ts
src/main.tsx
src/App.tsx
src/styles/tokens.css
src/styles/global.css
src/domain/types.ts
src/domain/pages.ts
src/data/mockData.ts
src/analytics/formatters.ts
src/analytics/filters.ts
src/analytics/aggregations.ts
src/analytics/actions.ts
src/components/AppShell.tsx
src/components/FilterBar.tsx
src/components/KpiCard.tsx
src/components/MetricSwitch.tsx
src/components/ScopeDrawer.tsx
src/components/DataTable.tsx
src/components/ActionBadge.tsx
src/components/charts/ParetoChart.tsx
src/components/charts/ScatterChart.tsx
src/components/charts/BubbleChart.tsx
src/components/charts/MatrixChart.tsx
src/pages/OverviewPage.tsx
src/pages/CoreTailPage.tsx
src/pages/FgVarietyPage.tsx
src/pages/FgSkuDeepDivePage.tsx
src/pages/PlvSupportPage.tsx
src/pages/SampleComplexityPage.tsx
src/pages/PlvSkuDeepDivePage.tsx
src/**/*.test.ts
src/**/*.test.tsx
tests/dashboard.spec.ts
```

Responsibility map:
- `domain/*`: type definitions and page metadata.
- `data/mockData.ts`: deterministic mock dataset.
- `analytics/*`: pure functions for filtering, aggregation, derived metrics, and action/reason logic.
- `components/*`: reusable UI primitives.
- `components/charts/*`: dependency-light SVG chart components.
- `pages/*`: one page composition per dashboard page.
- `tests/dashboard.spec.ts`: end-to-end smoke checks for navigation, sticky filters, scope drawer, and action table columns.

---

### Task 1: Scaffold The React App And Tooling

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`
- Test: `src/App.test.tsx`

**Interfaces:**
- Produces: runnable React app root at `src/App.tsx`.
- Produces: npm scripts `dev`, `build`, `test`, `test:watch`, and `e2e`.
- Later tasks consume the CSS custom properties declared in `src/styles/tokens.css`.

- [ ] **Step 1: Create npm package manifest**

Create `package.json` with:

```json
{
  "name": "assortment-optimization-dashboard-demo",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc -b && vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test"
  },
  "dependencies": {
    "@vitejs/plugin-react": "latest",
    "vite": "latest",
    "typescript": "latest",
    "react": "latest",
    "react-dom": "latest",
    "lucide-react": "latest"
  },
  "devDependencies": {
    "@playwright/test": "latest",
    "@testing-library/jest-dom": "latest",
    "@testing-library/react": "latest",
    "@testing-library/user-event": "latest",
    "jsdom": "latest",
    "vitest": "latest"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run:

```bash
npm install
```

Expected: `node_modules` and `package-lock.json` are created. If network access is blocked, rerun with the required sandbox/network approval.

- [ ] **Step 3: Create TypeScript and Vite config**

Create `tsconfig.json` with:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src", "vite.config.ts", "vitest.config.ts", "playwright.config.ts"],
  "references": []
}
```

Create `vite.config.ts` with:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5173,
  },
});
```

Create `vitest.config.ts` with:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
```

Create `playwright.config.ts` with:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
```

- [ ] **Step 4: Create test setup and HTML entry**

Create `src/test/setup.ts` with:

```ts
import "@testing-library/jest-dom/vitest";
```

Create `index.html` with:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Assortment Optimization Dashboard</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Create CSS tokens**

Create `src/styles/tokens.css` with:

```css
:root {
  color-scheme: light;
  --color-canvas: #f8f9fd;
  --color-surface: #ffffff;
  --color-surface-2: #f1f4fa;
  --color-border: #dde4ef;
  --color-border-strong: #bfd0e7;
  --color-ink: #161927;
  --color-muted: #5e667a;
  --color-subtle: #8892a7;
  --color-fg: #ca2e91;
  --color-fg-soft: #fde8f5;
  --color-strategy: #7a4de8;
  --color-strategy-soft: #efe9ff;
  --color-plv: #13a9d5;
  --color-plv-soft: #e6f8fc;
  --color-keep: #14805e;
  --color-keep-bg: #e6f6ef;
  --color-review: #9a6b00;
  --color-review-bg: #fff3cd;
  --color-simplify: #c73636;
  --color-simplify-bg: #fdecec;
  --shadow-soft: 0 18px 50px rgba(55, 67, 105, 0.1);
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 14px;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
}
```

Create `src/styles/global.css` with:

```css
@import "./tokens.css";

* {
  box-sizing: border-box;
}

html {
  min-width: 320px;
  background: var(--color-canvas);
  color: var(--color-ink);
  font-family: var(--font-sans);
}

body {
  margin: 0;
  min-height: 100vh;
}

button,
input,
select {
  font: inherit;
}

button {
  cursor: pointer;
}

button:focus-visible,
input:focus-visible,
select:focus-visible {
  outline: 3px solid rgba(122, 77, 232, 0.35);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 6: Create minimal app root**

Create `src/main.tsx` with:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

Create `src/App.tsx` with:

```tsx
export default function App() {
  return (
    <main aria-label="Assortment Optimization Dashboard">
      <h1>Assortment Optimization Analytics Framework</h1>
    </main>
  );
}
```

- [ ] **Step 7: Write smoke test**

Create `src/App.test.tsx` with:

```tsx
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders dashboard title", () => {
  render(<App />);
  expect(screen.getByRole("heading", { name: /assortment optimization analytics framework/i })).toBeInTheDocument();
});
```

- [ ] **Step 8: Run task verification**

Run:

```bash
npm test
npm run build
```

Expected: tests pass and Vite produces a production build.

- [ ] **Step 9: Commit**

Run:

```bash
git add package.json package-lock.json index.html tsconfig.json vite.config.ts vitest.config.ts playwright.config.ts src
git commit -m "chore: scaffold dashboard demo app"
```

Expected: one commit containing the app scaffold.

---

### Task 2: Add Domain Types, Page Metadata, And Mock Data

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/domain/pages.ts`
- Create: `src/data/mockData.ts`
- Test: `src/data/mockData.test.ts`

**Interfaces:**
- Produces: `DashboardPageId`, `ProductRecord`, `SkuRecord`, `PlvSkuRecord`, `FilterState`, `MetricKey`, `ActionStatus`.
- Produces: `dashboardPages` metadata used by nav, overview, and routing.
- Produces: `mockProducts`, `mockFgSkus`, and `mockPlvSkus` arrays used by analytics and pages.

- [ ] **Step 1: Create domain types**

Create `src/domain/types.ts` with:

```ts
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
export type Lifecycle = "Core" | "Growth" | "Mature" | "Tail" | "Exit";
export type AbcCategory = "A" | "B" | "C";

export interface FilterState {
  timePeriod: string;
  channelLvl1: string;
  brand: string;
  category: string;
  lifecycle: "All" | Lifecycle;
  abcCategory: "All" | AbcCategory;
  productSearch: string;
}

export interface ProductRecord {
  id: string;
  brand: string;
  category: string;
  productLvl1: string;
  lifecycle: Lifecycle;
  abcCategory: AbcCategory;
  channelLvl1: string;
  value: number;
  units: number;
  indicativeGm: number;
  indicativeGmPct: number;
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
  skuCode: string;
  skuName: string;
  size: string;
  flaCount: number;
  fla: string;
  value: number;
  units: number;
  indicativeGm: number;
  indicativeGmPct: number;
  rsp: number;
  map: number;
  cogsPerMlKg: number;
  lifecycle: Lifecycle;
}

export interface PlvSkuRecord {
  id: string;
  productId: string;
  skuCode: string;
  skuName: string;
  size: string;
  flaCount: number;
  fla: string;
  units: number;
  cost: number;
  cogsPerMlKg: number;
  lifecycle: Lifecycle;
  channelCovered: string[];
  sampleType: "Sachet" | "Deluxe Sample" | "Travel Size";
}

export interface DashboardPageMeta {
  id: DashboardPageId;
  title: string;
  group: "Overview" | "Product (FG)" | "Sample (PLV)";
  level?: "Level 1: Macro" | "Level 2: Diagnosis" | "Level 3: Micro";
  strategicQuestion?: string;
  description: string;
}
```

- [ ] **Step 2: Create page metadata**

Create `src/domain/pages.ts` with:

```ts
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
    description: "Separate top value drivers from the low-performing long tail across the portfolio.",
  },
  {
    id: "fg-variety",
    title: "FG Variety vs. Value",
    group: "Product (FG)",
    level: "Level 2: Diagnosis",
    strategicQuestion: "Is Complexity Justified?",
    description: "Flag products where high SKU and FLA variety fail to generate enough value.",
  },
  {
    id: "fg-sku-deep-dive",
    title: "FG SKU Deep Dive",
    group: "Product (FG)",
    level: "Level 3: Micro",
    strategicQuestion: "What Should We Keep, Review, or Simplify?",
    description: "Zoom into one product to identify low-volume, low-margin, or high-complexity SKUs.",
  },
  {
    id: "plv-support",
    title: "PLV Support vs. FG Sales",
    group: "Sample (PLV)",
    level: "Level 1: Macro",
    strategicQuestion: "Where is the Money?",
    description: "Check whether PLV support is proportionate to FG sales and units.",
  },
  {
    id: "sample-complexity",
    title: "Sample Complexity vs. Demand",
    group: "Sample (PLV)",
    level: "Level 2: Diagnosis",
    strategicQuestion: "Is Complexity Justified?",
    description: "Expose complex mini-assortments that lack shipped units to justify their existence.",
  },
  {
    id: "plv-sku-deep-dive",
    title: "PLV SKU Deep Dive",
    group: "Sample (PLV)",
    level: "Level 3: Micro",
    strategicQuestion: "What Should We Keep, Review, or Simplify?",
    description: "Zoom into one product to identify overlapping PLV sizes with no distinct sales role.",
  },
];
```

- [ ] **Step 3: Create deterministic mock data**

Create `src/data/mockData.ts` with at least 12 product records, 36 FG SKU records, and 24 PLV SKU records. Use the type imports from `src/domain/types.ts`.

Use these product examples so all dashboard quadrants are represented:

```ts
import type { FgSkuRecord, PlvSkuRecord, ProductRecord } from "../domain/types";

export const mockProducts: ProductRecord[] = [
  {
    id: "p-serum-core",
    brand: "Aurora",
    category: "Serum",
    productLvl1: "Hydra Serum",
    lifecycle: "Core",
    abcCategory: "A",
    channelLvl1: "Retail",
    value: 1280000,
    units: 410000,
    indicativeGm: 512000,
    indicativeGmPct: 0.4,
    rsp: 38,
    map: 32,
    skuCount: 5,
    flaCount: 8,
    plvSkuCount: 2,
    plvFlaCount: 3,
    plvUnits: 42000,
    plvCost: 24000,
    totalProductUnits: 452000,
    totalProductCost: 366000,
    plvChannelCoverageCount: 4,
  },
  {
    id: "p-cream-tail-complex",
    brand: "Aurora",
    category: "Cream",
    productLvl1: "Repair Cream",
    lifecycle: "Tail",
    abcCategory: "C",
    channelLvl1: "Retail",
    value: 145000,
    units: 42000,
    indicativeGm: 36000,
    indicativeGmPct: 0.25,
    rsp: 46,
    map: 39,
    skuCount: 11,
    flaCount: 16,
    plvSkuCount: 5,
    plvFlaCount: 9,
    plvUnits: 19000,
    plvCost: 28000,
    totalProductUnits: 61000,
    totalProductCost: 74000,
    plvChannelCoverageCount: 2,
  }
];

export const mockFgSkus: FgSkuRecord[] = [
  {
    id: "fg-serum-core-30",
    productId: "p-serum-core",
    skuCode: "FG-HYD-030",
    skuName: "Hydra Serum 30ml",
    size: "30ml",
    flaCount: 2,
    fla: "Classic, Holiday",
    value: 540000,
    units: 170000,
    indicativeGm: 226000,
    indicativeGmPct: 0.42,
    rsp: 38,
    map: 32,
    cogsPerMlKg: 0.68,
    lifecycle: "Core",
  }
];

export const mockPlvSkus: PlvSkuRecord[] = [
  {
    id: "plv-serum-core-sachet",
    productId: "p-serum-core",
    skuCode: "PLV-HYD-SCH",
    skuName: "Hydra Serum Sachet",
    size: "1ml",
    flaCount: 1,
    fla: "Classic",
    units: 30000,
    cost: 9000,
    cogsPerMlKg: 0.22,
    lifecycle: "Core",
    channelCovered: ["Retail", "Online", "Travel Retail"],
    sampleType: "Sachet",
  }
];
```

Then expand the arrays with enough additional records to meet the row counts above and include:
- One high value / low variety product.
- One high value / high variety product.
- One low value / high variety product.
- One low PLV units / high PLV SKU count product.
- One PLV SKU with overlapping sample role and high COGS.

- [ ] **Step 4: Write mock data tests**

Create `src/data/mockData.test.ts` with:

```ts
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
```

- [ ] **Step 5: Run task verification**

Run:

```bash
npm test -- src/data/mockData.test.ts
npm run build
```

Expected: mock data tests pass and TypeScript compiles.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/domain src/data src/test package.json package-lock.json
git commit -m "feat: add dashboard domain model and mock data"
```

Expected: one commit containing domain and mock data modules.

---

### Task 3: Add Analytics Calculation Functions

**Files:**
- Create: `src/analytics/formatters.ts`
- Create: `src/analytics/filters.ts`
- Create: `src/analytics/aggregations.ts`
- Create: `src/analytics/actions.ts`
- Test: `src/analytics/formatters.test.ts`
- Test: `src/analytics/filters.test.ts`
- Test: `src/analytics/aggregations.test.ts`
- Test: `src/analytics/actions.test.ts`

**Interfaces:**
- Produces: `filterProducts`, `filterFgSkus`, `filterPlvSkus`.
- Produces: `buildParetoRows`, `summarizeCoreTail`, `summarizeFgVariety`, `summarizePlvSupport`, `summarizeSampleComplexity`.
- Produces: `getFgSkuAction` and `getPlvSkuAction`, both returning `{ action: ActionStatus; reason: string }`.

- [ ] **Step 1: Add formatters**

Create `src/analytics/formatters.ts`:

```ts
export const compactNumber = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export const wholeNumber = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

export const percent = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
});

export const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatMetric(value: number, kind: "number" | "currency" | "percent" = "number") {
  if (kind === "currency") return currency.format(value);
  if (kind === "percent") return percent.format(value);
  return compactNumber.format(value);
}
```

- [ ] **Step 2: Add filters**

Create `src/analytics/filters.ts`:

```ts
import type { FgSkuRecord, FilterState, PlvSkuRecord, ProductRecord } from "../domain/types";

export const defaultFilters: FilterState = {
  timePeriod: "Latest 12 months",
  channelLvl1: "All",
  brand: "All",
  category: "All",
  lifecycle: "All",
  abcCategory: "All",
  productSearch: "",
};

export function filterProducts(products: ProductRecord[], filters: FilterState) {
  return products.filter((product) => {
    if (filters.channelLvl1 !== "All" && product.channelLvl1 !== filters.channelLvl1) return false;
    if (filters.brand !== "All" && product.brand !== filters.brand) return false;
    if (filters.category !== "All" && product.category !== filters.category) return false;
    if (filters.lifecycle !== "All" && product.lifecycle !== filters.lifecycle) return false;
    if (filters.abcCategory !== "All" && product.abcCategory !== filters.abcCategory) return false;
    if (filters.productSearch.trim()) {
      return product.productLvl1.toLowerCase().includes(filters.productSearch.trim().toLowerCase());
    }
    return true;
  });
}

export function filterFgSkus(skus: FgSkuRecord[], products: ProductRecord[], filters: FilterState) {
  const productIds = new Set(filterProducts(products, filters).map((product) => product.id));
  return skus.filter((sku) => productIds.has(sku.productId));
}

export function filterPlvSkus(skus: PlvSkuRecord[], products: ProductRecord[], filters: FilterState) {
  const productIds = new Set(filterProducts(products, filters).map((product) => product.id));
  return skus.filter((sku) => productIds.has(sku.productId));
}
```

- [ ] **Step 3: Add aggregation functions**

Create `src/analytics/aggregations.ts` with these exports:

```ts
import type { MetricKey, ProductRecord } from "../domain/types";

export interface ParetoRow {
  id: string;
  label: string;
  value: number;
  contribution: number;
  cumulativeContribution: number;
  segment: "A" | "B" | "C";
}

export function getProductMetric(product: ProductRecord, metric: MetricKey) {
  if (metric === "units") return product.units;
  if (metric === "indicativeGm") return product.indicativeGm;
  return product.value;
}

export function buildParetoRows(products: ProductRecord[], metric: MetricKey): ParetoRow[] {
  const sorted = [...products].sort((a, b) => getProductMetric(b, metric) - getProductMetric(a, metric));
  const total = sorted.reduce((sum, product) => sum + getProductMetric(product, metric), 0);
  let cumulative = 0;
  return sorted.map((product) => {
    const value = getProductMetric(product, metric);
    const contribution = total === 0 ? 0 : value / total;
    cumulative += contribution;
    const segment = cumulative <= 0.6 ? "A" : cumulative <= 0.9 ? "B" : "C";
    return {
      id: product.id,
      label: product.productLvl1,
      value,
      contribution,
      cumulativeContribution: cumulative,
      segment,
    };
  });
}

export function summarizeCoreTail(products: ProductRecord[], metric: MetricKey) {
  const rows = buildParetoRows(products, metric);
  const bySegment = (segment: "A" | "B" | "C") => rows.filter((row) => row.segment === segment);
  return {
    totalProductCount: products.length,
    aCount: bySegment("A").length,
    bCount: bySegment("B").length,
    cCount: bySegment("C").length,
    aPct: products.length ? bySegment("A").length / products.length : 0,
    bPct: products.length ? bySegment("B").length / products.length : 0,
    cPct: products.length ? bySegment("C").length / products.length : 0,
  };
}

export function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

export function summarizeFgVariety(products: ProductRecord[]) {
  return {
    totalProductCount: products.length,
    avgSkuCount: average(products.map((product) => product.skuCount)),
    avgFlaCount: average(products.map((product) => product.flaCount)),
  };
}

export function summarizePlvSupport(products: ProductRecord[]) {
  return {
    totalProductCount: products.length,
    productWithPlvCount: products.filter((product) => product.plvSkuCount > 0).length,
    totalPlvSkuCount: products.reduce((sum, product) => sum + product.plvSkuCount, 0),
    totalPlvUnits: products.reduce((sum, product) => sum + product.plvUnits, 0),
    totalPlvCost: products.reduce((sum, product) => sum + product.plvCost, 0),
  };
}

export function summarizeSampleComplexity(products: ProductRecord[]) {
  const withPlv = products.filter((product) => product.plvSkuCount > 0);
  return {
    totalProductCount: products.length,
    productWithPlvCount: withPlv.length,
    avgPlvSkuCount: average(withPlv.map((product) => product.plvSkuCount)),
    avgPlvFlaCount: average(withPlv.map((product) => product.plvFlaCount)),
  };
}
```

- [ ] **Step 4: Add action logic**

Create `src/analytics/actions.ts` with:

```ts
import type { ActionStatus, FgSkuRecord, PlvSkuRecord } from "../domain/types";

export interface ActionRecommendation {
  action: ActionStatus;
  reason: string;
}

export function getFgSkuAction(sku: FgSkuRecord, productTotals: { value: number; units: number; indicativeGm: number }): ActionRecommendation {
  const valueShare = productTotals.value ? sku.value / productTotals.value : 0;
  const unitsShare = productTotals.units ? sku.units / productTotals.units : 0;
  const gmShare = productTotals.indicativeGm ? sku.indicativeGm / productTotals.indicativeGm : 0;

  if (valueShare >= 0.2 || unitsShare >= 0.2 || gmShare >= 0.2) {
    return { action: "Keep", reason: "" };
  }
  if (unitsShare < 0.05 && valueShare < 0.05 && (sku.indicativeGmPct < 0.25 || sku.cogsPerMlKg > 1.2 || sku.flaCount >= 4)) {
    return { action: "Simplify", reason: sku.flaCount >= 4 ? "High FLA burden" : "Low units contribution" };
  }
  return { action: "Review", reason: "Mixed performance signals" };
}

export function getPlvSkuAction(sku: PlvSkuRecord, productTotals: { plvUnits: number }, siblingSkus: PlvSkuRecord[]): ActionRecommendation {
  const unitsShare = productTotals.plvUnits ? sku.units / productTotals.plvUnits : 0;
  const overlappingRole = siblingSkus.some(
    (other) => other.id !== sku.id && other.size === sku.size && other.sampleType === sku.sampleType,
  );

  if (unitsShare >= 0.25 && sku.cogsPerMlKg <= 0.6 && !overlappingRole) {
    return { action: "Keep", reason: "" };
  }
  if (unitsShare < 0.08 && (sku.cogsPerMlKg > 0.8 || overlappingRole || sku.channelCovered.length <= 1)) {
    return { action: "Simplify", reason: overlappingRole ? "Overlapping sample role" : "Low PLV units" };
  }
  return { action: "Review", reason: "Mixed demand and cost signals" };
}
```

- [ ] **Step 5: Add tests for analytics**

Create tests that verify:
- `formatMetric(1200000, "currency")` returns a formatted currency string.
- `filterProducts` respects brand/category/lifecycle filters.
- `buildParetoRows` sorts descending and returns cumulative contribution.
- `summarizeCoreTail` counts A/B/C segments.
- `getFgSkuAction` returns `Keep` with empty reason for high contribution.
- `getFgSkuAction` returns `Simplify` with non-empty reason for low contribution and high FLA burden.
- `getPlvSkuAction` returns `Simplify` with non-empty reason for overlapping low-unit PLV.

- [ ] **Step 6: Run task verification**

Run:

```bash
npm test -- src/analytics
npm run build
```

Expected: all analytics tests pass and TypeScript compiles.

- [ ] **Step 7: Commit**

Run:

```bash
git add src/analytics
git commit -m "feat: add dashboard analytics calculations"
```

Expected: one commit containing calculation modules and tests.

---

### Task 4: Build App Shell, Navigation, Sticky Filters, And Scope Drawer

**Files:**
- Modify: `src/App.tsx`
- Create: `src/components/AppShell.tsx`
- Create: `src/components/FilterBar.tsx`
- Create: `src/components/ScopeDrawer.tsx`
- Test: `src/components/AppShell.test.tsx`
- Test: `src/components/FilterBar.test.tsx`
- Test: `src/components/ScopeDrawer.test.tsx`

**Interfaces:**
- Produces: `AppShell({ currentPageId, onNavigate, children })`.
- Produces: `FilterBar({ filters, onChange, showProductSearch })`.
- Produces: `ScopeDrawer({ title, sections })`.
- Later page tasks render inside `AppShell` and read/update `FilterState`.

- [ ] **Step 1: Write shell tests first**

Create tests that assert:
- Navigation includes `Overview`, `Core vs. Tail`, `FG Variety vs. Value`, `Sample Complexity vs. Demand`.
- Active nav item has `aria-current="page"`.
- Filter bar renders global filters and product search only when `showProductSearch` is true.
- Scope drawer opens via button and closes with Escape.

- [ ] **Step 2: Implement AppShell**

Create `src/components/AppShell.tsx` with:

```tsx
import type { ReactNode } from "react";
import type { DashboardPageId } from "../domain/types";
import { dashboardPages } from "../domain/pages";

interface AppShellProps {
  currentPageId: DashboardPageId;
  onNavigate: (pageId: DashboardPageId) => void;
  children: ReactNode;
}

export function AppShell({ currentPageId, onNavigate, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="topbar-kicker">Dashboard demo</p>
          <h1>Assortment Optimization</h1>
        </div>
        <nav aria-label="Dashboard pages" className="topnav">
          {dashboardPages.map((page) => (
            <button
              key={page.id}
              type="button"
              aria-current={page.id === currentPageId ? "page" : undefined}
              onClick={() => onNavigate(page.id)}
            >
              {page.title}
            </button>
          ))}
        </nav>
      </header>
      {children}
    </div>
  );
}
```

Add CSS classes in `src/styles/global.css` for `.app-shell`, `.topbar`, `.topbar-kicker`, `.topnav`, and active nav button.

- [ ] **Step 3: Implement FilterBar**

Create `src/components/FilterBar.tsx` with controlled inputs for `FilterState`. Use native `<select>` controls for first demo reliability. Provide visible labels for every field.

Required props:

```ts
interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  showProductSearch: boolean;
  brands: string[];
  categories: string[];
  channels: string[];
}
```

CSS requirement: `.filter-bar { position: sticky; top: 0; z-index: 20; }`.

- [ ] **Step 4: Implement ScopeDrawer**

Create `src/components/ScopeDrawer.tsx` with a button, right-side drawer, Escape close behavior, focusable close button, and content sections.

Required props:

```ts
interface ScopeDrawerProps {
  title: string;
  sections: Array<{ heading: string; body: string[] }>;
}
```

- [ ] **Step 5: Wire shell in App**

Modify `src/App.tsx` to keep `currentPageId` and `filters` in state. Render `AppShell`, `FilterBar`, and an interim route screen showing the current page title and the text `This dashboard page will be built in the next implementation task.`

- [ ] **Step 6: Run task verification**

Run:

```bash
npm test -- src/components
npm run build
```

Expected: component tests pass and build succeeds.

- [ ] **Step 7: Commit**

Run:

```bash
git add src/App.tsx src/components src/styles
git commit -m "feat: add dashboard shell and sticky filters"
```

Expected: one commit containing shell, filter, and drawer.

---

### Task 5: Build Shared KPI, Table, Action, And Metric Switch Components

**Files:**
- Create: `src/components/KpiCard.tsx`
- Create: `src/components/MetricSwitch.tsx`
- Create: `src/components/DataTable.tsx`
- Create: `src/components/ActionBadge.tsx`
- Test: `src/components/KpiCard.test.tsx`
- Test: `src/components/MetricSwitch.test.tsx`
- Test: `src/components/DataTable.test.tsx`
- Test: `src/components/ActionBadge.test.tsx`

**Interfaces:**
- Produces: reusable display components consumed by all pages.
- `DataTable<T>` accepts columns, rows, and optional row id function.

- [ ] **Step 1: Write component tests**

Tests must verify:
- KPI label, value, and context render.
- Metric switch calls `onChange` with selected metric.
- Data table sorts numeric values descending after clicking a numeric column header.
- ActionBadge renders `Keep`, `Review`, and `Simplify` with accessible text.

- [ ] **Step 2: Implement KpiCard**

Create:

```tsx
interface KpiCardProps {
  label: string;
  value: string;
  context?: string;
  tone?: "neutral" | "fg" | "plv" | "strategy";
}

export function KpiCard({ label, value, context, tone = "neutral" }: KpiCardProps) {
  return (
    <article className={`kpi-card kpi-card-${tone}`}>
      <p>{label}</p>
      <strong>{value}</strong>
      {context ? <span>{context}</span> : null}
    </article>
  );
}
```

- [ ] **Step 3: Implement MetricSwitch**

Create a segmented button group with `aria-pressed` on the active button.

- [ ] **Step 4: Implement ActionBadge**

Create:

```tsx
import type { ActionStatus } from "../domain/types";

export function ActionBadge({ action }: { action: ActionStatus }) {
  return <span className={`action-badge action-${action.toLowerCase()}`}>{action}</span>;
}
```

- [ ] **Step 5: Implement DataTable**

Create a generic table with sortable headers. Use right-aligned numeric cells and sticky header CSS.

Column interface:

```ts
export interface DataTableColumn<T> {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  value: (row: T) => string | number | JSX.Element;
  sortValue?: (row: T) => string | number;
}
```

- [ ] **Step 6: Run task verification**

Run:

```bash
npm test -- src/components
npm run build
```

Expected: tests pass and build succeeds.

- [ ] **Step 7: Commit**

Run:

```bash
git add src/components src/styles
git commit -m "feat: add shared dashboard components"
```

Expected: one commit containing reusable components.

---

### Task 6: Build SVG Chart Primitives

**Files:**
- Create: `src/components/charts/chartUtils.ts`
- Create: `src/components/charts/ParetoChart.tsx`
- Create: `src/components/charts/ScatterChart.tsx`
- Create: `src/components/charts/BubbleChart.tsx`
- Create: `src/components/charts/MatrixChart.tsx`
- Test: `src/components/charts/chartUtils.test.ts`
- Test: `src/components/charts/ParetoChart.test.tsx`
- Test: `src/components/charts/ScatterChart.test.tsx`

**Interfaces:**
- Produces chart primitives that accept already-shaped chart rows.
- Avoids Recharts dependency for first demo.

- [ ] **Step 1: Implement chart utilities**

Create scale helpers:

```ts
export function extent(values: number[]) {
  return [Math.min(...values), Math.max(...values)] as const;
}

export function linearScale(domain: readonly [number, number], range: readonly [number, number]) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  if (d0 === d1) return () => (r0 + r1) / 2;
  return (value: number) => r0 + ((value - d0) / (d1 - d0)) * (r1 - r0);
}
```

- [ ] **Step 2: Implement ParetoChart**

Props:

```ts
interface ParetoChartProps {
  rows: Array<{ id: string; label: string; value: number; cumulativeContribution: number; segment: "A" | "B" | "C" }>;
  valueFormatter: (value: number) => string;
}
```

Render bars sorted in provided order and a cumulative line. Add accessible `<title>` and `<desc>` inside the SVG.

- [ ] **Step 3: Implement ScatterChart**

Props:

```ts
interface ScatterChartProps {
  rows: Array<{ id: string; label: string; x: number; y: number; group?: string }>;
  xLabel: string;
  yLabel: string;
  reviewZoneLabel?: string;
  xFormatter: (value: number) => string;
  yFormatter: (value: number) => string;
}
```

Render quadrant guides and optional review-zone label.

- [ ] **Step 4: Implement BubbleChart**

Props:

```ts
interface BubbleChartProps {
  rows: Array<{ id: string; label: string; x: number; y: number; size: number }>;
  xLabel: string;
  yLabel: string;
  xFormatter: (value: number) => string;
  yFormatter: (value: number) => string;
}
```

Bubble radius is scaled from `size`, with min 5 and max 20.

- [ ] **Step 5: Implement MatrixChart**

Props:

```ts
interface MatrixChartProps {
  rows: string[];
  columns: string[];
  activeCells: Array<{ row: string; column: string; tone: "keep" | "review" | "simplify" }>;
}
```

Use it for PLV SKU channel/sample matrices.

- [ ] **Step 6: Add chart tests**

Tests must verify:
- `linearScale([0, 100], [0, 10])(50)` returns `5`.
- ParetoChart renders one bar per row.
- ScatterChart renders point labels and axis labels.

- [ ] **Step 7: Run task verification**

Run:

```bash
npm test -- src/components/charts
npm run build
```

Expected: chart tests pass and build succeeds.

- [ ] **Step 8: Commit**

Run:

```bash
git add src/components/charts src/styles
git commit -m "feat: add dashboard chart primitives"
```

Expected: one commit containing chart primitives.

---

### Task 7: Build Overview, Core vs Tail, And FG Variety Pages

**Files:**
- Create: `src/pages/OverviewPage.tsx`
- Create: `src/pages/CoreTailPage.tsx`
- Create: `src/pages/FgVarietyPage.tsx`
- Modify: `src/App.tsx`
- Test: `src/pages/OverviewPage.test.tsx`
- Test: `src/pages/CoreTailPage.test.tsx`
- Test: `src/pages/FgVarietyPage.test.tsx`

**Interfaces:**
- Produces first three working pages.
- Consumes `dashboardPages`, `mockProducts`, `filterProducts`, `summarizeCoreTail`, `summarizeFgVariety`, `buildParetoRows`.

- [ ] **Step 1: Write page tests**

Tests must verify:
- Overview renders three strategic questions and six cards.
- Core vs. Tail renders decision statement, KPI cards, Pareto chart, table, and Scope button.
- FG Variety page defaults to `Value` x-axis and `SKU Count` y-axis.

- [ ] **Step 2: Build OverviewPage**

Create a clickable framework page with three columns and six cards. Props:

```ts
interface OverviewPageProps {
  onNavigate: (pageId: DashboardPageId) => void;
}
```

Use `dashboardPages` metadata. Do not include the PDF Page 1 data model.

- [ ] **Step 3: Build CoreTailPage**

Create page with:
- Decision statement.
- Metric switch: Value, Units, Indicative GM.
- KPI row from `summarizeCoreTail`.
- ParetoChart from `buildParetoRows`.
- DataTable with columns listed in the design spec.
- ScopeDrawer with FG-only definitions.

- [ ] **Step 4: Build FgVarietyPage**

Create page with:
- Decision statement.
- x-axis switch: Value, Units, Indicative GM.
- y-axis switch: SKU Count, FLA Count.
- KPI row from `summarizeFgVariety`.
- ScatterChart with review zone label `High variety / low value review zone`.
- DataTable with columns listed in the design spec.
- ScopeDrawer with FG-only definitions.

- [ ] **Step 5: Wire pages in App**

Render `OverviewPage`, `CoreTailPage`, or `FgVarietyPage` based on `currentPageId`. For remaining routes, keep the explicit interim route screen from Task 4 until each page is implemented by its later task.

- [ ] **Step 6: Run task verification**

Run:

```bash
npm test -- src/pages
npm run build
```

Expected: page tests pass and build succeeds.

- [ ] **Step 7: Commit**

Run:

```bash
git add src/App.tsx src/pages src/styles
git commit -m "feat: add overview and FG portfolio pages"
```

Expected: one commit containing overview and two FG pages.

---

### Task 8: Build FG SKU Deep Dive

**Files:**
- Create: `src/pages/FgSkuDeepDivePage.tsx`
- Modify: `src/App.tsx`
- Test: `src/pages/FgSkuDeepDivePage.test.tsx`

**Interfaces:**
- Produces FG SKU deep-dive page with product search, Pareto chart, bubble chart, table, `Suggested action`, and `Reason`.
- Consumes `getFgSkuAction`.

- [ ] **Step 1: Write page test**

Test must verify:
- Page renders title `FG SKU Deep Dive`.
- Table includes `Suggested action` and `Reason` headers.
- At least one `Simplify` badge and non-empty reason appears in mock data.
- At least one `Keep` badge appears with an empty reason cell.

- [ ] **Step 2: Build page**

Create page with:
- Product selection from filtered products.
- KPI cards from selected product and SKU totals.
- ParetoChart by selected metric.
- BubbleChart with x = selected metric, y = COGS per ml/kg, size = FLA Count.
- DataTable columns listed in the design spec.
- `ActionBadge` for each recommendation.
- ScopeDrawer with FG-only definitions.

- [ ] **Step 3: Wire page in App**

Render `FgSkuDeepDivePage` when `currentPageId === "fg-sku-deep-dive"`. Pass `showProductSearch={true}` to `FilterBar`.

- [ ] **Step 4: Run task verification**

Run:

```bash
npm test -- src/pages/FgSkuDeepDivePage.test.tsx
npm run build
```

Expected: page test passes and build succeeds.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/App.tsx src/pages/FgSkuDeepDivePage.tsx src/styles
git commit -m "feat: add FG SKU deep dive page"
```

Expected: one commit containing FG SKU deep dive.

---

### Task 9: Build PLV Support And Sample Complexity Pages

**Files:**
- Create: `src/pages/PlvSupportPage.tsx`
- Create: `src/pages/SampleComplexityPage.tsx`
- Modify: `src/App.tsx`
- Test: `src/pages/PlvSupportPage.test.tsx`
- Test: `src/pages/SampleComplexityPage.test.tsx`

**Interfaces:**
- Produces two PLV product-level pages.
- Consumes `summarizePlvSupport` and `summarizeSampleComplexity`.

- [ ] **Step 1: Write tests**

Tests must verify:
- PLV Support default y-axis label is `PLV Units / Total Product Units`.
- Sample Complexity page title is exactly `Sample Complexity vs. Demand`.
- Sample Complexity page includes both PLV Units and channel coverage scatter sections.

- [ ] **Step 2: Build PlvSupportPage**

Create page with:
- Decision statement.
- KPI row from `summarizePlvSupport`.
- ScatterChart with default x = FG Units and y = PLV Units / Total Product Units.
- Switchable x-axis and y-axis options from spec.
- DataTable columns from spec.
- ScopeDrawer explaining table includes all products and chart includes only products with PLV.

- [ ] **Step 3: Build SampleComplexityPage**

Create page with:
- Decision statement.
- KPI row from `summarizeSampleComplexity`.
- ScatterChart 1: x = PLV Units, y = Number of PLV SKUs or Number of PLV FLA.
- ScatterChart 2: x = PLV channel coverage count, y = Number of PLV SKUs or Number of PLV FLA.
- DataTable columns from spec.
- ScopeDrawer explaining product count vs PLV-only scope.

- [ ] **Step 4: Wire pages in App**

Render PLV pages for `plv-support` and `sample-complexity`.

- [ ] **Step 5: Run task verification**

Run:

```bash
npm test -- src/pages/PlvSupportPage.test.tsx src/pages/SampleComplexityPage.test.tsx
npm run build
```

Expected: tests pass and build succeeds.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/App.tsx src/pages/PlvSupportPage.tsx src/pages/SampleComplexityPage.tsx src/styles
git commit -m "feat: add PLV product-level analysis pages"
```

Expected: one commit containing PLV product-level pages.

---

### Task 10: Build PLV SKU Deep Dive

**Files:**
- Create: `src/pages/PlvSkuDeepDivePage.tsx`
- Modify: `src/App.tsx`
- Test: `src/pages/PlvSkuDeepDivePage.test.tsx`

**Interfaces:**
- Produces PLV SKU deep-dive page with product search, Pareto chart, bubble chart, matrix charts, table, `Suggested action`, and `Reason`.
- Consumes `getPlvSkuAction`.

- [ ] **Step 1: Write page test**

Test must verify:
- Page renders title `PLV SKU Deep Dive`.
- Table includes `Suggested action` and `Reason`.
- At least one `Simplify` PLV SKU has a non-empty reason.
- Channel coverage matrix renders channel lvl2 column labels.
- Sample type matrix renders `Sachet`, `Deluxe Sample`, or `Travel Size`.

- [ ] **Step 2: Build page**

Create page with:
- Product selection from products with PLV.
- KPI row from selected product.
- ParetoChart with PLV Units.
- BubbleChart with x = PLV Units by SKU, y = COGS per ml/kg, size = FLA Count.
- MatrixChart for channel coverage.
- MatrixChart for sample type.
- DataTable columns from spec.
- `ActionBadge` for each recommendation.
- ScopeDrawer with PLV-only definitions.

- [ ] **Step 3: Wire page in App**

Render `PlvSkuDeepDivePage` when `currentPageId === "plv-sku-deep-dive"`. Pass `showProductSearch={true}` to `FilterBar`.

- [ ] **Step 4: Run task verification**

Run:

```bash
npm test -- src/pages/PlvSkuDeepDivePage.test.tsx
npm run build
```

Expected: page test passes and build succeeds.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/App.tsx src/pages/PlvSkuDeepDivePage.tsx src/styles
git commit -m "feat: add PLV SKU deep dive page"
```

Expected: one commit containing PLV SKU deep dive.

---

### Task 11: Add End-To-End QA And Visual Polish

**Files:**
- Create: `tests/dashboard.spec.ts`
- Modify: `src/styles/global.css`
- Modify: page and component files only if QA reveals layout, copy, or accessibility issues.

**Interfaces:**
- Produces Playwright coverage for critical demo flows.
- Produces polished responsive desktop/tablet/mobile behavior.

- [ ] **Step 1: Write Playwright smoke test**

Create `tests/dashboard.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("dashboard navigation, filters, and scope drawer work", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /assortment optimization/i })).toBeVisible();

  await page.getByRole("button", { name: "FG Variety vs. Value" }).click();
  await expect(page.getByRole("heading", { name: "FG Variety vs. Value" })).toBeVisible();
  await expect(page.getByText("Decision this page supports")).toBeVisible();

  await expect(page.getByLabel("Time period")).toBeVisible();
  await page.getByRole("button", { name: /scope & definitions/i }).click();
  await expect(page.getByRole("dialog")).toContainText("FG only");

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});
```

- [ ] **Step 2: Add responsive QA test**

Extend `tests/dashboard.spec.ts`:

```ts
test("sticky filters remain visible after scroll", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "PLV SKU Deep Dive" }).click();
  await page.mouse.wheel(0, 1200);
  await expect(page.getByLabel("Time period")).toBeVisible();
});
```

- [ ] **Step 3: Run full verification**

Run:

```bash
npm test
npm run build
npm run e2e
```

Expected: unit tests, production build, and Playwright tests pass.

- [ ] **Step 4: Manual visual QA**

Start the dev server:

```bash
npm run dev
```

Open `http://127.0.0.1:5173` and inspect:
- Overview resembles the source PDF framework page.
- Filters remain sticky while scrolling.
- Page 2 defaults to Value vs SKU Count and allows FLA Count switch.
- Page 4 defaults to PLV Units / Total Product Units.
- Page 5 title is `Sample Complexity vs. Demand`.
- FG and PLV deep-dive tables show `Suggested action` and `Reason`.
- Keep rows have empty reason.
- Review and Simplify rows have non-empty reason.
- Scope drawer contains definitions and closes with Escape.

- [ ] **Step 5: Commit**

Run:

```bash
git add tests src
git commit -m "test: add dashboard smoke coverage and polish"
```

Expected: final QA commit.
