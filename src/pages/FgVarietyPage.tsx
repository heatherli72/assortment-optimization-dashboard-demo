import { useState } from "react";
import { summarizeFgVariety } from "../analytics/aggregations";
import { currency, wholeNumber } from "../analytics/formatters";
import { DataTable, type DataTableColumn } from "../components/DataTable";
import { KpiCard } from "../components/KpiCard";
import { MetricSwitch } from "../components/MetricSwitch";
import { ScopeDrawer } from "../components/ScopeDrawer";
import { ScatterChart } from "../components/charts/ScatterChart";
import type { MetricKey, ProductRecord, VarietyMetric } from "../domain/types";
import { fgScopeSections, getProductMetricValue, metricFormatter, metricLabel, metricOptions, varietyLabel, varietyOptions } from "./pageHelpers";

interface FgVarietyPageProps {
  products: ProductRecord[];
}

export function FgVarietyPage({ products }: FgVarietyPageProps) {
  const [xMetric, setXMetric] = useState<MetricKey>("value");
  const [yMetric, setYMetric] = useState<VarietyMetric>("skuCount");
  const summary = summarizeFgVariety(products);
  const columns: Array<DataTableColumn<ProductRecord>> = [
    { key: "product", header: "Product Lvl 1", value: (row) => row.productLvl1, sortValue: (row) => row.productLvl1 },
    { key: "brand", header: "Brand", value: (row) => row.brand, sortValue: (row) => row.brand },
    { key: "value", header: "Value", align: "right", value: (row) => currency.format(row.value), sortValue: (row) => row.value },
    { key: "units", header: "Units", align: "right", value: (row) => wholeNumber.format(row.units), sortValue: (row) => row.units },
    { key: "sku", header: "SKU Count", align: "right", value: (row) => row.skuCount, sortValue: (row) => row.skuCount },
    { key: "fla", header: "FLA Count", align: "right", value: (row) => row.flaCount, sortValue: (row) => row.flaCount },
    { key: "life", header: "Lifecycle", value: (row) => row.lifecycle, sortValue: (row) => row.lifecycle },
    { key: "abc", header: "ABC Category", value: (row) => row.abcCategory, sortValue: (row) => row.abcCategory },
  ];

  return (
    <main className="page">
      <section className="page-title">
        <p className="eyebrow">Decision this page supports</p>
        <h2>FG Variety vs. Value</h2>
        <p>Find products where SKU or FLA breadth is not justified by value, units, or margin.</p>
      </section>
      <div className="toolbar-row">
        <MetricSwitch label="X-axis" value={xMetric} options={metricOptions} onChange={setXMetric} />
        <MetricSwitch label="Y-axis" value={yMetric} options={varietyOptions} onChange={setYMetric} />
        <ScopeDrawer title="FG Variety vs. Value scope" sections={fgScopeSections} />
      </div>
      <section className="kpi-grid">
        <KpiCard tone="fg" label="Total products" value={wholeNumber.format(summary.totalProductCount)} />
        <KpiCard label="Avg SKU" value={summary.avgSkuCount.toFixed(1)} />
        <KpiCard label="Avg FLA" value={summary.avgFlaCount.toFixed(1)} />
      </section>
      <section className="chart-panel">
        <h3>{metricLabel[xMetric]} vs. {varietyLabel[yMetric]}</h3>
        <ScatterChart
          xLabel={metricLabel[xMetric]}
          yLabel={varietyLabel[yMetric]}
          reviewZoneLabel="High variety / low value review zone"
          xFormatter={metricFormatter(xMetric)}
          yFormatter={wholeNumber.format}
          rows={products.map((product) => ({
            id: product.id,
            label: product.productLvl1,
            x: getProductMetricValue(product, xMetric),
            y: product[yMetric],
            group: product.abcCategory,
          }))}
        />
      </section>
      <section className="data-panel">
        <h3>Detailed table</h3>
        <DataTable columns={columns} rows={products} getRowId={(row) => row.id} />
      </section>
    </main>
  );
}
