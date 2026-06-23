import { useMemo, useState } from "react";
import { getFgSkuAction } from "../analytics/actions";
import { buildParetoRows } from "../analytics/aggregations";
import { currency, percent, wholeNumber } from "../analytics/formatters";
import { ActionBadge } from "../components/ActionBadge";
import { DataTable, type DataTableColumn } from "../components/DataTable";
import { KpiCard } from "../components/KpiCard";
import { MetricSwitch } from "../components/MetricSwitch";
import { ScopeDrawer } from "../components/ScopeDrawer";
import { BubbleChart } from "../components/charts/BubbleChart";
import { ParetoChart } from "../components/charts/ParetoChart";
import type { FgSkuRecord, MetricKey, ProductRecord } from "../domain/types";
import { emptyReason, fgScopeSections, metricFormatter, metricLabel, metricOptions } from "./pageHelpers";

interface FgSkuDeepDivePageProps {
  products: ProductRecord[];
  fgSkus: FgSkuRecord[];
}

export function FgSkuDeepDivePage({ products, fgSkus }: FgSkuDeepDivePageProps) {
  const [metric, setMetric] = useState<MetricKey>("value");
  const productsWithSkus = products.filter((product) => fgSkus.some((sku) => sku.productId === product.id));
  const defaultProduct =
    productsWithSkus.find((product) =>
      fgSkus
        .filter((sku) => sku.productId === product.id)
        .some((sku) => getFgSkuAction(sku, product).action === "Simplify"),
    ) ?? productsWithSkus[0];
  const [selectedProductId, setSelectedProductId] = useState(defaultProduct?.id ?? "");
  const selectedProduct = productsWithSkus.find((product) => product.id === selectedProductId) ?? defaultProduct;
  const productSkus = fgSkus.filter((sku) => sku.productId === selectedProduct?.id);
  const rows = useMemo(
    () =>
      productSkus.map((sku) => ({
        ...sku,
        recommendation: getFgSkuAction(sku, selectedProduct ?? { value: 0, units: 0, indicativeGm: 0 }),
      })),
    [productSkus, selectedProduct],
  );

  const skuPareto = buildParetoRows(
    rows.map((sku) => ({
      id: sku.id,
      productLvl1: sku.skuName,
      value: sku.value,
      units: sku.units,
      indicativeGm: sku.indicativeGm,
    }) as ProductRecord),
    metric,
  );
  const columns: Array<DataTableColumn<(typeof rows)[number]>> = [
    { key: "sku", header: "SKU", value: (row) => row.skuName, sortValue: (row) => row.skuName },
    { key: "size", header: "Size", value: (row) => row.size, sortValue: (row) => row.size },
    { key: "fla", header: "FLA Count", align: "right", value: (row) => row.flaCount, sortValue: (row) => row.flaCount },
    { key: "value", header: "Sales value", align: "right", value: (row) => currency.format(row.value), sortValue: (row) => row.value },
    { key: "units", header: "Units", align: "right", value: (row) => wholeNumber.format(row.units), sortValue: (row) => row.units },
    { key: "gm", header: "Indicative GM", align: "right", value: (row) => currency.format(row.indicativeGm), sortValue: (row) => row.indicativeGm },
    { key: "gmPct", header: "GM %", align: "right", value: (row) => percent.format(row.indicativeGmPct), sortValue: (row) => row.indicativeGmPct },
    { key: "cogs", header: "COGS per ml/kg", align: "right", value: (row) => currency.format(row.cogsPerMlKg), sortValue: (row) => row.cogsPerMlKg },
    { key: "action", header: "Suggested action", value: (row) => <ActionBadge action={row.recommendation.action} />, sortValue: (row) => row.recommendation.action },
    { key: "reason", header: "Reason", value: (row) => <span className={row.recommendation.reason ? "" : "empty-reason"}>{emptyReason(row.recommendation.reason)}</span>, sortValue: (row) => row.recommendation.reason },
  ];

  return (
    <main className="page">
      <section className="page-title">
        <p className="eyebrow">Decision this page supports</p>
        <h2>FG SKU Deep Dive</h2>
        <p>Identify exactly which FG SKUs to keep, review, or simplify inside a selected product.</p>
      </section>
      <div className="toolbar-row">
        <label className="inline-select">
          Product
          <select value={selectedProduct?.id ?? ""} onChange={(event) => setSelectedProductId(event.target.value)}>
            {productsWithSkus.map((product) => (
              <option key={product.id} value={product.id}>{product.productLvl1}</option>
            ))}
          </select>
        </label>
        <MetricSwitch label="SKU Pareto metric" value={metric} options={metricOptions} onChange={setMetric} />
        <ScopeDrawer title="FG SKU Deep Dive scope" sections={fgScopeSections} />
      </div>
      <section className="kpi-grid">
        <KpiCard tone="fg" label="Selected product" value={selectedProduct?.productLvl1 ?? "No product"} context={selectedProduct?.brand} />
        <KpiCard label="FG SKUs" value={wholeNumber.format(rows.length)} />
        <KpiCard label="Total units" value={wholeNumber.format(rows.reduce((sum, row) => sum + row.units, 0))} />
        <KpiCard label="Simplify candidates" value={wholeNumber.format(rows.filter((row) => row.recommendation.action === "Simplify").length)} />
      </section>
      <section className="split-grid">
        <div className="chart-panel">
          <h3>{metricLabel[metric]} Pareto by SKU</h3>
          <ParetoChart rows={skuPareto} valueFormatter={metricFormatter(metric)} />
        </div>
        <div className="chart-panel">
          <h3>{metricLabel[metric]} vs COGS per ml/kg</h3>
          <BubbleChart
            rows={rows.map((sku) => ({
              id: sku.id,
              label: sku.skuCode,
              x: metric === "units" ? sku.units : metric === "indicativeGm" ? sku.indicativeGm : sku.value,
              y: sku.cogsPerMlKg,
              size: sku.flaCount,
            }))}
            xLabel={metricLabel[metric]}
            yLabel="COGS per ml/kg"
            xFormatter={metricFormatter(metric)}
            yFormatter={(value) => currency.format(value)}
          />
        </div>
      </section>
      <section className="data-panel">
        <h3>Detailed table</h3>
        <DataTable columns={columns} rows={rows} getRowId={(row) => row.id} />
      </section>
    </main>
  );
}
