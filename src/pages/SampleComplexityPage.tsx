import { useState } from "react";
import { summarizeSampleComplexity } from "../analytics/aggregations";
import { currency, wholeNumber } from "../analytics/formatters";
import { DataTable, type DataTableColumn } from "../components/DataTable";
import { KpiCard } from "../components/KpiCard";
import { MetricSwitch } from "../components/MetricSwitch";
import { ScopeDrawer } from "../components/ScopeDrawer";
import { ScatterChart } from "../components/charts/ScatterChart";
import type { ProductRecord, VarietyMetric } from "../domain/types";
import { plvScopeSections, varietyLabel, varietyOptions } from "./pageHelpers";

export function SampleComplexityPage({ products }: { products: ProductRecord[] }) {
  const [yMetric, setYMetric] = useState<VarietyMetric>("skuCount");
  const withPlv = products.filter((product) => product.plvSkuCount > 0);
  const summary = summarizeSampleComplexity(products);
  const readY = (product: ProductRecord) => (yMetric === "skuCount" ? product.plvSkuCount : product.plvFlaCount);
  const columns: Array<DataTableColumn<ProductRecord>> = [
    { key: "brand", header: "Brand", value: (row) => row.brand, sortValue: (row) => row.brand },
    { key: "category", header: "Category", value: (row) => row.category, sortValue: (row) => row.category },
    { key: "product", header: "Product Lvl 1", value: (row) => row.productLvl1, sortValue: (row) => row.productLvl1 },
    { key: "plvUnits", header: "PLV Units", align: "right", value: (row) => wholeNumber.format(row.plvUnits), sortValue: (row) => row.plvUnits },
    { key: "coverage", header: "PLV channel coverage count", align: "right", value: (row) => row.plvChannelCoverageCount, sortValue: (row) => row.plvChannelCoverageCount },
    { key: "plvSku", header: "Number of PLV SKU", align: "right", value: (row) => row.plvSkuCount, sortValue: (row) => row.plvSkuCount },
    { key: "plvFla", header: "Number of PLV FLA", align: "right", value: (row) => row.plvFlaCount, sortValue: (row) => row.plvFlaCount },
    { key: "plvCost", header: "PLV Cost", align: "right", value: (row) => currency.format(row.plvCost), sortValue: (row) => row.plvCost },
    { key: "fgValue", header: "FG Sales value", align: "right", value: (row) => currency.format(row.value), sortValue: (row) => row.value },
    { key: "abc", header: "ABC Category", value: (row) => row.abcCategory, sortValue: (row) => row.abcCategory },
  ];

  return (
    <main className="page">
      <section className="page-title">
        <p className="eyebrow">Decision this page supports</p>
        <h2>Sample Complexity vs. Demand</h2>
        <p>Expose complex mini-assortments where PLV variety or coverage is not matched by shipped demand.</p>
      </section>
      <div className="toolbar-row">
        <MetricSwitch label="Y-axis" value={yMetric} options={varietyOptions} onChange={setYMetric} />
        <ScopeDrawer title="Sample Complexity scope" sections={plvScopeSections} />
      </div>
      <section className="kpi-grid">
        <KpiCard tone="plv" label="Total products" value={wholeNumber.format(summary.totalProductCount)} context="All filtered products" />
        <KpiCard label="Products with PLV" value={wholeNumber.format(summary.productWithPlvCount)} />
        <KpiCard label="Avg PLV SKU" value={summary.avgPlvSkuCount.toFixed(1)} />
        <KpiCard label="Avg PLV FLA" value={summary.avgPlvFlaCount.toFixed(1)} />
      </section>
      <section className="split-grid">
        <div className="chart-panel">
          <h3>PLV Units vs {varietyLabel[yMetric]}</h3>
          <ScatterChart
            rows={withPlv.map((product) => ({ id: product.id, label: product.productLvl1, x: product.plvUnits, y: readY(product), group: product.abcCategory }))}
            xLabel="PLV Units"
            yLabel={varietyLabel[yMetric]}
            reviewZoneLabel="High complexity / low demand"
            xFormatter={wholeNumber.format}
            yFormatter={wholeNumber.format}
          />
        </div>
        <div className="chart-panel">
          <h3>Channel Coverage vs {varietyLabel[yMetric]}</h3>
          <ScatterChart
            rows={withPlv.map((product) => ({ id: product.id, label: product.productLvl1, x: product.plvChannelCoverageCount, y: readY(product), group: product.abcCategory }))}
            xLabel="PLV channel coverage count"
            yLabel={varietyLabel[yMetric]}
            reviewZoneLabel="Broad coverage / high complexity"
            xFormatter={wholeNumber.format}
            yFormatter={wholeNumber.format}
          />
        </div>
      </section>
      <section className="data-panel">
        <h3>Detailed table</h3>
        <DataTable columns={columns} rows={withPlv} getRowId={(row) => row.id} />
      </section>
    </main>
  );
}
