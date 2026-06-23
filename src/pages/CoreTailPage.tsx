import { useState } from "react";
import { buildParetoRows, summarizeCoreTail } from "../analytics/aggregations";
import { currency, percent, wholeNumber } from "../analytics/formatters";
import { DataTable, type DataTableColumn } from "../components/DataTable";
import { KpiCard } from "../components/KpiCard";
import { MetricSwitch } from "../components/MetricSwitch";
import { ParetoChart } from "../components/charts/ParetoChart";
import type { FgSkuRecord, MetricKey, ProductRecord } from "../domain/types";
import { metricFormatter, metricLabel, metricOptions } from "./pageHelpers";

interface CoreTailPageProps {
  products: ProductRecord[];
  fgSkus: FgSkuRecord[];
  onOpenProduct: (productName: string) => void;
}

export const coreTailScopeSections = [
  {
    heading: "Scope",
    body: [
      "FG product-level portfolio view. Filters apply only to the current product set shown on this page.",
      "ABC assignment is recalculated from the selected KPI and chart metric.",
    ],
  },
  {
    heading: "ABC / Pareto rule",
    body: [
      "A products contribute the first 60% of the selected metric.",
      "B products contribute the next 60%-90% of the selected metric.",
      "C products contribute the remaining bottom 10% of the selected metric.",
    ],
  },
  {
    heading: "Indicative GM",
    body: [
      "Product-level Indicative GM = FG Sales Value - FG COGS - PLV/PLS COGS.",
      "It includes the sample/PLV support cost available in this demo, but still excludes downstream trade, retail discounts, and future sales-chain effects.",
    ],
  },
  {
    heading: "Contribution",
    body: [
      "Sales value contribution, Units contribution, and Indicative GM contribution are calculated to brand within the current filter context.",
      "RSP and MAP are shown as product-level min/max values because each product can contain multiple SKUs.",
    ],
  },
];

const segmentCopy = (segment: "A" | "B" | "C", metric: MetricKey, count: number, total: number, pct: number) => {
  const label = metricLabel[metric];
  const share = `${count} / ${total}`;
  const productShare = percent.format(pct);
  if (segment === "A") return `${share} products (${productShare}) contributing the first 60% of ${label}`;
  if (segment === "B") return `${share} products (${productShare}) contributing the next 60%-90% of ${label}`;
  return `${share} products (${productShare}) contributing the remaining bottom 10% of ${label}`;
};

const brandContribution = (product: ProductRecord, products: ProductRecord[], metric: MetricKey) => {
  const brandRows = products.filter((row) => row.brand === product.brand);
  const total = brandRows.reduce((sum, row) => {
    if (metric === "units") return sum + row.units;
    if (metric === "indicativeGm") return sum + row.indicativeGm;
    return sum + row.value;
  }, 0);
  const value = metric === "units" ? product.units : metric === "indicativeGm" ? product.indicativeGm : product.value;
  return total ? value / total : 0;
};

const minMax = (values: number[]) => {
  if (!values.length) return { min: 0, max: 0 };
  return { min: Math.min(...values), max: Math.max(...values) };
};

export function CoreTailPage({ products, fgSkus, onOpenProduct }: CoreTailPageProps) {
  const [metric, setMetric] = useState<MetricKey>("value");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const summary = summarizeCoreTail(products, metric);
  const paretoRows = buildParetoRows(products, metric);
  const skuStats = new Map(
    products.map((product) => {
      const skus = fgSkus.filter((sku) => sku.productId === product.id);
      return [
        product.id,
        {
          rsp: minMax(skus.map((sku) => sku.rsp)),
          map: minMax(skus.map((sku) => sku.map)),
        },
      ];
    }),
  );
  const columns: Array<DataTableColumn<ProductRecord>> = [
    { key: "product", header: "Product L1", sticky: true, value: (row) => <button className="product-link" type="button" onClick={() => onOpenProduct(row.productLvl1)}>{row.productLvl1}</button>, sortValue: (row) => row.productLvl1 },
    { key: "brand", header: "Brand", value: (row) => row.brand, sortValue: (row) => row.brand },
    { key: "category", header: "Category", value: (row) => row.category, sortValue: (row) => row.category },
    { key: "abc", header: "ABC Type", value: (row) => row.abcCategory, sortValue: (row) => row.abcCategory },
    { key: "value", header: "Sales Value", align: "right", value: (row) => currency.format(row.value), sortValue: (row) => row.value },
    { key: "valueShare", header: "Sales Value contribution to brand", align: "right", value: (row) => percent.format(brandContribution(row, products, "value")), sortValue: (row) => brandContribution(row, products, "value") },
    { key: "units", header: "Units", align: "right", value: (row) => wholeNumber.format(row.units), sortValue: (row) => row.units },
    { key: "unitsShare", header: "Units contribution to brand", align: "right", value: (row) => percent.format(brandContribution(row, products, "units")), sortValue: (row) => brandContribution(row, products, "units") },
    { key: "gm", header: "Indicative GM", align: "right", value: (row) => currency.format(row.indicativeGm), sortValue: (row) => row.indicativeGm },
    { key: "gmShare", header: "Indicative GM contribution to brand", align: "right", value: (row) => percent.format(brandContribution(row, products, "indicativeGm")), sortValue: (row) => brandContribution(row, products, "indicativeGm") },
    { key: "gmPct", header: "Indicative GM %", align: "right", value: (row) => percent.format(row.indicativeGmPct), sortValue: (row) => row.indicativeGmPct },
    { key: "minRsp", header: "Min RSP", align: "right", value: (row) => currency.format(skuStats.get(row.id)?.rsp.min ?? row.rsp), sortValue: (row) => skuStats.get(row.id)?.rsp.min ?? row.rsp },
    { key: "maxRsp", header: "Max RSP", align: "right", value: (row) => currency.format(skuStats.get(row.id)?.rsp.max ?? row.rsp), sortValue: (row) => skuStats.get(row.id)?.rsp.max ?? row.rsp },
    { key: "minMap", header: "Min COGS", align: "right", value: (row) => currency.format(skuStats.get(row.id)?.map.min ?? row.map), sortValue: (row) => skuStats.get(row.id)?.map.min ?? row.map },
    { key: "maxMap", header: "Max COGS", align: "right", value: (row) => currency.format(skuStats.get(row.id)?.map.max ?? row.map), sortValue: (row) => skuStats.get(row.id)?.map.max ?? row.map },
  ];

  return (
    <main className="page analysis-page">
      <section className="kpi-grid">
        <KpiCard tone="fg" label="Total products" value={wholeNumber.format(summary.totalProductCount)} context="Filtered FG products" />
        <KpiCard label="A products" value={wholeNumber.format(summary.aCount)} context={segmentCopy("A", metric, summary.aCount, summary.totalProductCount, summary.aPct)} />
        <KpiCard label="B products" value={wholeNumber.format(summary.bCount)} context={segmentCopy("B", metric, summary.bCount, summary.totalProductCount, summary.bPct)} />
        <KpiCard label="C products" value={wholeNumber.format(summary.cCount)} context={segmentCopy("C", metric, summary.cCount, summary.totalProductCount, summary.cPct)} />
      </section>
      <section className="chart-panel">
        <div className="chart-panel-head">
          <h3>{metricLabel[metric]} Pareto by Product</h3>
          <div className="chart-controls">
            <MetricSwitch label="KPI & chart metric" value={metric} options={metricOptions} onChange={setMetric} />
          </div>
        </div>
        <ParetoChart
          exportFilename={`core-vs-tail-${metric}-pareto`}
          measureLabel={metricLabel[metric]}
          onClearSelection={() => setSelectedProductId(null)}
          onSelectRow={setSelectedProductId}
          rows={paretoRows}
          selectedId={selectedProductId}
          valueFormatter={metricFormatter(metric)}
        />
      </section>
      <section className="data-panel">
        <DataTable
          columns={columns}
          rows={products}
          getRowId={(row) => row.id}
          exportFilename="core-vs-tail-detail-table"
          selectedRowId={selectedProductId}
          selectionLabel="Clear selected product"
          onClearSelection={() => setSelectedProductId(null)}
        />
      </section>
    </main>
  );
}
