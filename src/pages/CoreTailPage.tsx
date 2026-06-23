import { useState } from "react";
import { buildParetoRows, productContribution, summarizeCoreTail } from "../analytics/aggregations";
import { currency, percent, wholeNumber } from "../analytics/formatters";
import { DataTable, type DataTableColumn } from "../components/DataTable";
import { KpiCard } from "../components/KpiCard";
import { MetricSwitch } from "../components/MetricSwitch";
import { ScopeDrawer } from "../components/ScopeDrawer";
import { ParetoChart } from "../components/charts/ParetoChart";
import type { MetricKey, ProductRecord } from "../domain/types";
import { fgScopeSections, formatPercent, metricFormatter, metricLabel, metricOptions } from "./pageHelpers";

interface CoreTailPageProps {
  products: ProductRecord[];
}

export function CoreTailPage({ products }: CoreTailPageProps) {
  const [metric, setMetric] = useState<MetricKey>("value");
  const summary = summarizeCoreTail(products, metric);
  const paretoRows = buildParetoRows(products, metric);
  const columns: Array<DataTableColumn<ProductRecord>> = [
    { key: "brand", header: "Brand", value: (row) => row.brand, sortValue: (row) => row.brand },
    { key: "category", header: "Category", value: (row) => row.category, sortValue: (row) => row.category },
    { key: "product", header: "Product Lvl 1", value: (row) => row.productLvl1, sortValue: (row) => row.productLvl1 },
    { key: "value", header: "Sales value", align: "right", value: (row) => currency.format(row.value), sortValue: (row) => row.value },
    { key: "valueShare", header: "Value contrib.", align: "right", value: (row) => percent.format(productContribution(row, products, "value")) },
    { key: "units", header: "Units", align: "right", value: (row) => wholeNumber.format(row.units), sortValue: (row) => row.units },
    { key: "gm", header: "Indicative GM", align: "right", value: (row) => currency.format(row.indicativeGm), sortValue: (row) => row.indicativeGm },
    { key: "rsp", header: "RSP", align: "right", value: (row) => currency.format(row.rsp), sortValue: (row) => row.rsp },
    { key: "map", header: "MAP", align: "right", value: (row) => currency.format(row.map), sortValue: (row) => row.map },
    { key: "gmPct", header: "GM %", align: "right", value: (row) => percent.format(row.indicativeGmPct), sortValue: (row) => row.indicativeGmPct },
    { key: "life", header: "Lifecycle", value: (row) => row.lifecycle, sortValue: (row) => row.lifecycle },
    { key: "abc", header: "ABC Category", value: (row) => row.abcCategory, sortValue: (row) => row.abcCategory },
  ];

  return (
    <main className="page">
      <PageHeader title="Core vs. Tail" statement="Decision this page supports: identify where the portfolio makes money and where long-tail complexity starts." />
      <div className="toolbar-row">
        <MetricSwitch label="Pareto metric" value={metric} options={metricOptions} onChange={setMetric} />
        <ScopeDrawer title="Core vs. Tail scope" sections={fgScopeSections} />
      </div>
      <section className="kpi-grid">
        <KpiCard tone="fg" label="Total products" value={wholeNumber.format(summary.totalProductCount)} context="Filtered FG products" />
        <KpiCard label="A products" value={wholeNumber.format(summary.aCount)} context={`${formatPercent(summary.aPct)} of products`} />
        <KpiCard label="B products" value={wholeNumber.format(summary.bCount)} context={`${formatPercent(summary.bPct)} of products`} />
        <KpiCard label="C products" value={wholeNumber.format(summary.cCount)} context={`${formatPercent(summary.cPct)} of products`} />
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
