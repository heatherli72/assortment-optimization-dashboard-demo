import { useState } from "react";
import { summarizeFgVariety } from "../analytics/aggregations";
import { currency, formatNullablePercent, wholeNumber } from "../analytics/formatters";
import { DataTable, type DataTableColumn } from "../components/DataTable";
import { KpiCard } from "../components/KpiCard";
import { MetricSwitch } from "../components/MetricSwitch";
import { ScatterChart } from "../components/charts/ScatterChart";
import type { MetricKey, ProductRecord, VarietyMetric } from "../domain/types";
import { getProductMetricValue, metricFormatter, metricLabel, metricOptions, varietyOptions } from "./pageHelpers";

interface FgVarietyPageProps {
  products: ProductRecord[];
  onOpenProduct: (product: ProductRecord) => void;
}

export function FgVarietyPage({ products, onOpenProduct }: FgVarietyPageProps) {
  const [xMetric, setXMetric] = useState<MetricKey>("value");
  const [yMetric, setYMetric] = useState<VarietyMetric>("skuCount");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const summary = summarizeFgVariety(products);
  const yLabel = yMetric === "skuCount" ? "FG SKU Count" : "FG FLA Count";
  const columns: Array<DataTableColumn<ProductRecord>> = [
    { key: "product", header: "Product L1", sticky: true, value: (row) => <button className="product-link" type="button" onClick={() => onOpenProduct(row)}>{row.productLvl1}</button>, sortValue: (row) => row.productLvl1 },
    { key: "brand", header: "Brand", value: (row) => row.brand, sortValue: (row) => row.brand },
    { key: "category", header: "Category", value: (row) => row.category, sortValue: (row) => row.category },
    { key: "abc", header: "ABC Type", value: (row) => row.abcCategory, sortValue: (row) => row.abcCategory },
    { key: "value", header: "Sales Value", align: "right", value: (row) => currency.format(row.value), sortValue: (row) => row.value },
    { key: "units", header: "Units", align: "right", value: (row) => wholeNumber.format(row.units), sortValue: (row) => row.units },
    { key: "gm", header: "Indicative GM", align: "right", value: (row) => currency.format(row.indicativeGm), sortValue: (row) => row.indicativeGm },
    { key: "gmPct", header: "Indicative GM %", align: "right", value: (row) => formatNullablePercent(row.indicativeGmPct), sortValue: (row) => row.indicativeGmPct ?? Number.NEGATIVE_INFINITY },
    { key: "sku", header: "FG SKU Count", align: "right", value: (row) => row.skuCount, sortValue: (row) => row.skuCount },
    { key: "fla", header: "FG FLA Count", align: "right", value: (row) => row.flaCount, sortValue: (row) => row.flaCount },
    { key: "salesPerSku", header: "Sales per SKU", align: "right", value: (row) => currency.format(row.value / row.skuCount), sortValue: (row) => row.value / row.skuCount },
    { key: "salesPerFla", header: "Sales per FLA", align: "right", value: (row) => currency.format(row.value / row.flaCount), sortValue: (row) => row.value / row.flaCount },
  ];

  return (
    <main className="page">
      <section className="kpi-grid">
        <KpiCard tone="fg" label="Total products" value={wholeNumber.format(summary.totalProductCount)} />
        <KpiCard label="Average FG SKU Count" value={summary.avgSkuCount.toFixed(1)} />
        <KpiCard label="Average FG FLA Count" value={summary.avgFlaCount.toFixed(1)} />
      </section>
      <section className="chart-panel">
        <div className="chart-panel-head">
          <h3>{yLabel} vs. {metricLabel[xMetric]}</h3>
        </div>
        <div className="axis-control-layout">
          <div className="axis-selector-y">
            <MetricSwitch label="Y-axis" value={yMetric} options={varietyOptions} onChange={setYMetric} />
          </div>
          <div className="axis-control-main">
            <ScatterChart
              xLabel={metricLabel[xMetric]}
              yLabel={yLabel}
              reviewZoneLabel="Watch: high variety / low value"
              selectedId={selectedProductId}
              onClearSelection={() => setSelectedProductId(null)}
              onSelectRow={setSelectedProductId}
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
            <div className="axis-selector-x">
              <MetricSwitch label="X-axis" value={xMetric} options={metricOptions} onChange={setXMetric} />
            </div>
          </div>
        </div>
      </section>
      <section className="data-panel">
        <DataTable
          columns={columns}
          rows={products}
          getRowId={(row) => row.id}
          exportFilename="fg-variety-table"
          selectedRowId={selectedProductId}
          selectionLabel="Clear selected product"
          onClearSelection={() => setSelectedProductId(null)}
        />
      </section>
    </main>
  );
}
