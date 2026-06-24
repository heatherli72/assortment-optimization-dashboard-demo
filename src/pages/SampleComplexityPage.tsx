import { useState } from "react";
import { summarizeSampleComplexity } from "../analytics/aggregations";
import { currency, percent, wholeNumber } from "../analytics/formatters";
import { DataTable, type DataTableColumn } from "../components/DataTable";
import { KpiCard } from "../components/KpiCard";
import { MetricSwitch } from "../components/MetricSwitch";
import { ScatterChart } from "../components/charts/ScatterChart";
import type { ProductRecord, VarietyMetric } from "../domain/types";
import { varietyOptions } from "./pageHelpers";

const brandContribution = (product: ProductRecord, products: ProductRecord[]) => {
  const brandRows = products.filter((row) => row.brand === product.brand);
  const total = brandRows.reduce((sum, row) => sum + row.value, 0);
  return total ? product.value / total : 0;
};

export function SampleComplexityPage({ products, onOpenProduct }: { products: ProductRecord[]; onOpenProduct: (product: ProductRecord) => void }) {
  const [yMetric, setYMetric] = useState<VarietyMetric>("skuCount");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const withPlv = products.filter((product) => product.plvSkuCount > 0);
  const summary = summarizeSampleComplexity(products);
  const readY = (product: ProductRecord) => (yMetric === "skuCount" ? product.plvSkuCount : product.plvFlaCount);
  const yLabel = yMetric === "skuCount" ? "PLV SKU Count" : "PLV FLA Count";
  const columns: Array<DataTableColumn<ProductRecord>> = [
    { key: "product", header: "Product L1", sticky: true, value: (row) => <button className="product-link" type="button" onClick={() => onOpenProduct(row)}>{row.productLvl1}</button>, sortValue: (row) => row.productLvl1 },
    { key: "brand", header: "Brand", value: (row) => row.brand, sortValue: (row) => row.brand },
    { key: "category", header: "Category", value: (row) => row.category, sortValue: (row) => row.category },
    { key: "abc", header: "ABC Type", value: (row) => row.abcCategory, sortValue: (row) => row.abcCategory },
    { key: "fgValue", header: "FG Sales Value", align: "right", value: (row) => currency.format(row.value), sortValue: (row) => row.value },
    { key: "fgContribution", header: "FG Sales Value contribution to brand", align: "right", value: (row) => percent.format(brandContribution(row, products)), sortValue: (row) => brandContribution(row, products) },
    { key: "plvUnits", header: "PLV Units", align: "right", value: (row) => wholeNumber.format(row.plvUnits), sortValue: (row) => row.plvUnits },
    { key: "coverage", header: "PLV Channel L1 distribution", align: "right", value: (row) => row.plvChannelCoverageCount, sortValue: (row) => row.plvChannelCoverageCount },
    { key: "plvSku", header: "PLV SKU Count", align: "right", value: (row) => row.plvSkuCount, sortValue: (row) => row.plvSkuCount },
    { key: "plvFla", header: "PLV FLA Count", align: "right", value: (row) => row.plvFlaCount, sortValue: (row) => row.plvFlaCount },
    { key: "plvCost", header: "PLV COGS", align: "right", value: (row) => currency.format(row.plvCost), sortValue: (row) => row.plvCost },
  ];

  return (
    <main className="page">
      <section className="kpi-grid">
        <KpiCard tone="plv" label="Products with PLV" value={wholeNumber.format(summary.productWithPlvCount)} />
        <KpiCard label="Average PLV SKU Count" value={summary.avgPlvSkuCount.toFixed(1)} />
        <KpiCard label="Average PLV FLA Count" value={summary.avgPlvFlaCount.toFixed(1)} />
        <KpiCard group="volume" label="PLV Units" value={wholeNumber.format(withPlv.reduce((sum, product) => sum + product.plvUnits, 0))} />
      </section>
      <section className="split-grid">
        <div className="chart-panel">
          <div className="chart-panel-head">
            <h3>{yLabel} vs. PLV Units (Demand)</h3>
            <div className="chart-controls">
              <MetricSwitch label="Y-axis" value={yMetric} options={varietyOptions} onChange={setYMetric} />
            </div>
          </div>
          <ScatterChart
            rows={withPlv.map((product) => ({ id: product.id, label: product.productLvl1, x: product.plvUnits, y: readY(product), group: product.abcCategory }))}
            xLabel="PLV Units"
            yLabel={yLabel}
            reviewZoneLabel="Watch: high complexity / low demand"
            selectedId={selectedProductId}
            onClearSelection={() => setSelectedProductId(null)}
            onSelectRow={setSelectedProductId}
            xFormatter={wholeNumber.format}
            yFormatter={wholeNumber.format}
          />
        </div>
        <div className="chart-panel">
          <div className="chart-panel-head">
            <h3>{yLabel} vs. Channel distribution</h3>
            <div className="chart-controls">
              <MetricSwitch label="Y-axis" value={yMetric} options={varietyOptions} onChange={setYMetric} />
            </div>
          </div>
          <ScatterChart
            rows={withPlv.map((product) => ({ id: product.id, label: product.productLvl1, x: product.plvChannelCoverageCount, y: readY(product), group: product.abcCategory }))}
            xLabel="Channel L1 distribution"
            yLabel={yLabel}
            reviewZoneLabel="Watch: high complexity / low coverage"
            selectedId={selectedProductId}
            onClearSelection={() => setSelectedProductId(null)}
            onSelectRow={setSelectedProductId}
            xFormatter={wholeNumber.format}
            yFormatter={wholeNumber.format}
          />
        </div>
      </section>
      <section className="data-panel">
        <DataTable
          columns={columns}
          rows={withPlv}
          getRowId={(row) => row.id}
          exportFilename="plv-complexity-table"
          selectedRowId={selectedProductId}
          selectionLabel="Clear selected product"
          onClearSelection={() => setSelectedProductId(null)}
        />
      </section>
    </main>
  );
}
