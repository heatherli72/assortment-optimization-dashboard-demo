import { useState } from "react";
import { summarizePlvSupport } from "../analytics/aggregations";
import { currency, percent, wholeNumber } from "../analytics/formatters";
import { DataTable, type DataTableColumn } from "../components/DataTable";
import { KpiCard } from "../components/KpiCard";
import { MetricSwitch, type MetricSwitchOption } from "../components/MetricSwitch";
import { ScopeDrawer } from "../components/ScopeDrawer";
import { ScatterChart } from "../components/charts/ScatterChart";
import type { MetricKey, ProductRecord } from "../domain/types";
import { formatRatio, getProductMetricValue, metricFormatter, metricLabel, metricOptions, plvScopeSections, ratio } from "./pageHelpers";

type PlvSupportY = "plvUnitsShare" | "plvCostToFgValue" | "plvSkuShare" | "plvCostShare";

const yOptions: Array<MetricSwitchOption<PlvSupportY>> = [
  { value: "plvUnitsShare", label: "PLV Units / Total Product Units" },
  { value: "plvCostToFgValue", label: "PLV Cost / FG Sales Value" },
  { value: "plvSkuShare", label: "PLV SKU Count / Total Product SKU Count" },
  { value: "plvCostShare", label: "PLV Cost / Total Product Cost" },
];

const getY = (product: ProductRecord, yMetric: PlvSupportY) => {
  if (yMetric === "plvCostToFgValue") return ratio(product.plvCost, product.value);
  if (yMetric === "plvSkuShare") return ratio(product.plvSkuCount, product.skuCount + product.plvSkuCount);
  if (yMetric === "plvCostShare") return ratio(product.plvCost, product.totalProductCost);
  return ratio(product.plvUnits, product.totalProductUnits);
};

export function PlvSupportPage({ products }: { products: ProductRecord[] }) {
  const [xMetric, setXMetric] = useState<MetricKey>("units");
  const [yMetric, setYMetric] = useState<PlvSupportY>("plvUnitsShare");
  const summary = summarizePlvSupport(products);
  const chartProducts = products.filter((product) => product.plvSkuCount > 0);
  const columns: Array<DataTableColumn<ProductRecord>> = [
    { key: "product", header: "Product Lvl 1", value: (row) => row.productLvl1, sortValue: (row) => row.productLvl1 },
    { key: "brand", header: "Brand", value: (row) => row.brand, sortValue: (row) => row.brand },
    { key: "fgValue", header: "FG Sales value", align: "right", value: (row) => currency.format(row.value), sortValue: (row) => row.value },
    { key: "fgUnits", header: "FG Units", align: "right", value: (row) => wholeNumber.format(row.units), sortValue: (row) => row.units },
    { key: "plvUnitsShare", header: "PLV Units / Total Product Units", align: "right", value: (row) => formatRatio(row.plvUnits, row.totalProductUnits), sortValue: (row) => ratio(row.plvUnits, row.totalProductUnits) },
    { key: "plvSku", header: "PLV SKU Count", align: "right", value: (row) => row.plvSkuCount, sortValue: (row) => row.plvSkuCount },
    { key: "plvCost", header: "PLV Cost", align: "right", value: (row) => currency.format(row.plvCost), sortValue: (row) => row.plvCost },
  ];

  return (
    <main className="page">
      <section className="page-title">
        <p className="eyebrow">Decision this page supports</p>
        <h2>PLV Support vs. FG Sales</h2>
        <p>Check whether sample support is proportionate to the FG value and demand it supports.</p>
      </section>
      <div className="toolbar-row">
        <MetricSwitch label="X-axis" value={xMetric} options={metricOptions} onChange={setXMetric} />
        <MetricSwitch label="Y-axis" value={yMetric} options={yOptions} onChange={setYMetric} />
        <ScopeDrawer title="PLV Support scope" sections={plvScopeSections} />
      </div>
      <section className="kpi-grid">
        <KpiCard tone="plv" label="Total products" value={wholeNumber.format(summary.totalProductCount)} context="All filtered products" />
        <KpiCard label="Products with PLV" value={wholeNumber.format(summary.productWithPlvCount)} />
        <KpiCard label="PLV units" value={wholeNumber.format(summary.totalPlvUnits)} />
        <KpiCard label="PLV cost" value={currency.format(summary.totalPlvCost)} />
      </section>
      <section className="chart-panel">
        <h3>{metricLabel[xMetric]} vs {yOptions.find((option) => option.value === yMetric)?.label}</h3>
        <ScatterChart
          rows={chartProducts.map((product) => ({
            id: product.id,
            label: product.productLvl1,
            x: getProductMetricValue(product, xMetric),
            y: getY(product, yMetric),
            group: product.abcCategory,
          }))}
          xLabel={metricLabel[xMetric]}
          yLabel={yOptions.find((option) => option.value === yMetric)?.label ?? "PLV Units / Total Product Units"}
          reviewZoneLabel="High support / low FG demand review zone"
          xFormatter={metricFormatter(xMetric)}
          yFormatter={percent.format}
        />
      </section>
      <section className="data-panel">
        <h3>Detailed table</h3>
        <DataTable columns={columns} rows={products} getRowId={(row) => row.id} />
      </section>
    </main>
  );
}
