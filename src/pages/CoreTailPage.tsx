import { useState } from "react";
import { buildParetoRows, summarizeCoreTail } from "../analytics/aggregations";
import { currency, percent, wholeNumber } from "../analytics/formatters";
import { DataTable, type DataTableColumn } from "../components/DataTable";
import { KpiCard } from "../components/KpiCard";
import { MetricSwitch } from "../components/MetricSwitch";
import { ScopeDrawer } from "../components/ScopeDrawer";
import { ParetoChart } from "../components/charts/ParetoChart";
import type { FgSkuRecord, MetricKey, ProductRecord } from "../domain/types";
import { fgScopeSections, metricFormatter, metricLabel, metricOptions } from "./pageHelpers";

interface CoreTailPageProps {
  products: ProductRecord[];
  fgSkus: FgSkuRecord[];
}

const coreTailScopeSections = [
  ...fgScopeSections,
  {
    heading: "Indicative GM",
    body: [
      "Indicative GM = Sales - Cost * Quantity.",
      "It excludes free PLV/sample cost and downstream trade or retail discounts, so it should be used as a directional reference only.",
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

const segmentCopy = (segment: "A" | "B" | "C", metric: MetricKey) => {
  const label = metricLabel[metric];
  if (segment === "A") return `Top products contributing the first 60% of ${label}`;
  if (segment === "B") return `Products contributing the next 60%-90% of ${label}`;
  return `Products contributing the remaining bottom 10% of ${label}`;
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

export function CoreTailPage({ products, fgSkus }: CoreTailPageProps) {
  const [metric, setMetric] = useState<MetricKey>("value");
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
    { key: "brand", header: "Brand", value: (row) => row.brand, sortValue: (row) => row.brand },
    { key: "category", header: "Category", value: (row) => row.category, sortValue: (row) => row.category },
    { key: "product", header: "Product Lvl 1", value: (row) => row.productLvl1, sortValue: (row) => row.productLvl1 },
    { key: "value", header: "Sales value", align: "right", value: (row) => currency.format(row.value), sortValue: (row) => row.value },
    { key: "valueShare", header: "Sales value contribution to brand", align: "right", value: (row) => percent.format(brandContribution(row, products, "value")), sortValue: (row) => brandContribution(row, products, "value") },
    { key: "units", header: "Units", align: "right", value: (row) => wholeNumber.format(row.units), sortValue: (row) => row.units },
    { key: "unitsShare", header: "Units contribution to brand", align: "right", value: (row) => percent.format(brandContribution(row, products, "units")), sortValue: (row) => brandContribution(row, products, "units") },
    { key: "gm", header: "Indicative GM", align: "right", value: (row) => currency.format(row.indicativeGm), sortValue: (row) => row.indicativeGm },
    { key: "gmShare", header: "Indicative GM contribution to brand", align: "right", value: (row) => percent.format(brandContribution(row, products, "indicativeGm")), sortValue: (row) => brandContribution(row, products, "indicativeGm") },
    { key: "gmPct", header: "Indicative GM %", align: "right", value: (row) => percent.format(row.indicativeGmPct), sortValue: (row) => row.indicativeGmPct },
    { key: "minRsp", header: "Min RSP", align: "right", value: (row) => currency.format(skuStats.get(row.id)?.rsp.min ?? row.rsp), sortValue: (row) => skuStats.get(row.id)?.rsp.min ?? row.rsp },
    { key: "maxRsp", header: "Max RSP", align: "right", value: (row) => currency.format(skuStats.get(row.id)?.rsp.max ?? row.rsp), sortValue: (row) => skuStats.get(row.id)?.rsp.max ?? row.rsp },
    { key: "minMap", header: "Min MAP", align: "right", value: (row) => currency.format(skuStats.get(row.id)?.map.min ?? row.map), sortValue: (row) => skuStats.get(row.id)?.map.min ?? row.map },
    { key: "maxMap", header: "Max MAP", align: "right", value: (row) => currency.format(skuStats.get(row.id)?.map.max ?? row.map), sortValue: (row) => skuStats.get(row.id)?.map.max ?? row.map },
    { key: "life", header: "Lifecycle", value: (row) => row.lifecycle, sortValue: (row) => row.lifecycle },
    { key: "abc", header: "ABC Category", value: (row) => row.abcCategory, sortValue: (row) => row.abcCategory },
  ];

  return (
    <main className="page analysis-page">
      <div className="analysis-topline">
        <p><strong>Decision this page supports:</strong> identify where the portfolio makes money and where long-tail complexity starts.</p>
        <ScopeDrawer title="Core vs. Tail scope" sections={coreTailScopeSections} />
      </div>
      <aside className="vertical-metric-panel" aria-label="Core vs. Tail metric controls">
        <MetricSwitch label="Controls KPI and chart metric" value={metric} options={metricOptions} onChange={setMetric} />
      </aside>
      <section className="kpi-grid">
        <KpiCard tone="fg" label="Total products" value={wholeNumber.format(summary.totalProductCount)} context="Filtered FG products" />
        <KpiCard label="A products" value={wholeNumber.format(summary.aCount)} context={segmentCopy("A", metric)} />
        <KpiCard label="B products" value={wholeNumber.format(summary.bCount)} context={segmentCopy("B", metric)} />
        <KpiCard label="C products" value={wholeNumber.format(summary.cCount)} context={segmentCopy("C", metric)} />
      </section>
      <section className="chart-panel">
        <h3>{metricLabel[metric]} Pareto by Product</h3>
        <ParetoChart rows={paretoRows} valueFormatter={metricFormatter(metric)} />
      </section>
      <section className="data-panel">
        <h3>Detailed table</h3>
        <DataTable columns={columns} rows={products} getRowId={(row) => row.id} />
      </section>
    </main>
  );
}

function PageHeader({ title, statement }: { title: string; statement: string }) {
  return (
    <section className="page-title">
      <p className="eyebrow">Decision this page supports</p>
      <h2>{title}</h2>
      <p>{statement}</p>
    </section>
  );
}
