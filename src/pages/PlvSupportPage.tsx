import { useState } from "react";
import { summarizePlvSupport } from "../analytics/aggregations";
import { currency, percent, wholeNumber } from "../analytics/formatters";
import { DataTable, type DataTableColumn } from "../components/DataTable";
import { KpiCard } from "../components/KpiCard";
import { MetricSwitch, type MetricSwitchOption } from "../components/MetricSwitch";
import { ScatterChart } from "../components/charts/ScatterChart";
import type { MetricKey, ProductRecord } from "../domain/types";
import { formatRatio, getProductMetricValue, metricFormatter, metricLabel, metricOptions, ratio } from "./pageHelpers";

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

export function PlvSupportPage({ products, onOpenProduct }: { products: ProductRecord[]; onOpenProduct: (product: ProductRecord) => void }) {
  const [xMetric, setXMetric] = useState<MetricKey>("units");
  const [yMetric, setYMetric] = useState<PlvSupportY>("plvUnitsShare");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const analysisProducts = products.filter((product) => product.plvSkuCount > 0);
  const summary = summarizePlvSupport(analysisProducts);
  const totalProductSkuCount = analysisProducts.reduce((sum, product) => sum + product.skuCount + product.plvSkuCount, 0);
  const totalProductUnits = analysisProducts.reduce((sum, product) => sum + product.totalProductUnits, 0);
  const totalProductCost = analysisProducts.reduce((sum, product) => sum + product.totalProductCost, 0);
  const totalFgValue = analysisProducts.reduce((sum, product) => sum + product.value, 0);
  const columns: Array<DataTableColumn<ProductRecord>> = [
    { key: "product", header: "Product L1", sticky: true, value: (row) => <button className="product-link" type="button" onClick={() => onOpenProduct(row)}>{row.productLvl1}</button>, sortValue: (row) => row.productLvl1 },
    { key: "brand", header: "Brand", value: (row) => row.brand, sortValue: (row) => row.brand },
    { key: "category", header: "Category", value: (row) => row.category, sortValue: (row) => row.category },
    { key: "abc", header: "ABC Type", value: (row) => row.abcCategory, sortValue: (row) => row.abcCategory },
    { key: "fgValue", header: "FG Sales Value", align: "right", value: (row) => currency.format(row.value), sortValue: (row) => row.value },
    { key: "fgUnits", header: "FG Units", align: "right", value: (row) => wholeNumber.format(row.units), sortValue: (row) => row.units },
    { key: "plvSku", header: "PLV SKU Count", align: "right", value: (row) => row.plvSkuCount, sortValue: (row) => row.plvSkuCount },
    { key: "totalSku", header: "Total Product SKU Count", align: "right", value: (row) => row.skuCount + row.plvSkuCount, sortValue: (row) => row.skuCount + row.plvSkuCount },
    { key: "plvSkuRatio", header: "PLV SKU Count / Total Product SKU Count", align: "right", value: (row) => formatRatio(row.plvSkuCount, row.skuCount + row.plvSkuCount), sortValue: (row) => ratio(row.plvSkuCount, row.skuCount + row.plvSkuCount) },
    { key: "plvUnits", header: "PLV Units", align: "right", value: (row) => wholeNumber.format(row.plvUnits), sortValue: (row) => row.plvUnits },
    { key: "totalUnits", header: "Total Product Units", align: "right", value: (row) => wholeNumber.format(row.totalProductUnits), sortValue: (row) => row.totalProductUnits },
    { key: "plvUnitsShare", header: "PLV Units / Total Product Units", align: "right", value: (row) => formatRatio(row.plvUnits, row.totalProductUnits), sortValue: (row) => ratio(row.plvUnits, row.totalProductUnits) },
    { key: "plvCost", header: "PLV COGS", align: "right", value: (row) => currency.format(row.plvCost), sortValue: (row) => row.plvCost },
    { key: "totalCost", header: "Total Product COGS", align: "right", value: (row) => currency.format(row.totalProductCost), sortValue: (row) => row.totalProductCost },
    { key: "plvCostShare", header: "PLV COGS / Total Product COGS", align: "right", value: (row) => formatRatio(row.plvCost, row.totalProductCost), sortValue: (row) => ratio(row.plvCost, row.totalProductCost) },
    { key: "plvCostToFg", header: "PLV COGS / FG Sales Value", align: "right", value: (row) => formatRatio(row.plvCost, row.value), sortValue: (row) => ratio(row.plvCost, row.value) },
  ];

  return (
    <main className="page">
      <section className="kpi-grid">
        <KpiCard label="Products with PLV" value={wholeNumber.format(summary.totalProductCount)} context="Filtered PLV products" />
        <KpiCard group="mix" label="PLV SKU Count" value={wholeNumber.format(summary.totalPlvSkuCount)} />
        <KpiCard group="mix" label="PLV SKU / Total SKU" value={percent.format(ratio(summary.totalPlvSkuCount, totalProductSkuCount))} />
        <KpiCard group="volume" label="PLV units" value={wholeNumber.format(summary.totalPlvUnits)} />
        <KpiCard group="volume" label="PLV units / Total units" value={percent.format(ratio(summary.totalPlvUnits, totalProductUnits))} />
        <KpiCard group="cost" label="PLV COGS" value={currency.format(summary.totalPlvCost)} />
        <KpiCard group="cost" label="PLV COGS / Total COGS" value={percent.format(ratio(summary.totalPlvCost, totalProductCost))} />
        <KpiCard group="cost" label="PLV COGS / FG Sales Value" value={percent.format(ratio(summary.totalPlvCost, totalFgValue))} />
      </section>
      <section className="chart-panel">
        <div className="chart-panel-head">
          <h3>{yOptions.find((option) => option.value === yMetric)?.label} vs {metricLabel[xMetric]}</h3>
        </div>
        <div className="axis-control-layout">
          <div className="axis-selector-y">
            <MetricSwitch label="Y-axis" value={yMetric} options={yOptions} onChange={setYMetric} />
          </div>
          <div className="axis-control-main">
            <ScatterChart
              rows={analysisProducts.map((product) => ({
                id: product.id,
                label: product.productLvl1,
                x: getProductMetricValue(product, xMetric),
                y: getY(product, yMetric),
                group: product.abcCategory,
                details: { "ABC Type": product.abcCategory, Brand: product.brand },
              }))}
              xLabel={metricLabel[xMetric]}
              yLabel={yOptions.find((option) => option.value === yMetric)?.label ?? "PLV Units / Total Product Units"}
              reviewZoneLabel="Watch: high support / low FG demand"
              selectedId={selectedProductId}
              onClearSelection={() => setSelectedProductId(null)}
              onSelectRow={setSelectedProductId}
              xFormatter={metricFormatter(xMetric)}
              yFormatter={percent.format}
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
          rows={analysisProducts}
          getRowId={(row) => row.id}
          exportFilename="plv-support-table"
          selectedRowId={selectedProductId}
          selectionLabel="Clear selected product"
          onClearSelection={() => setSelectedProductId(null)}
        />
      </section>
    </main>
  );
}
