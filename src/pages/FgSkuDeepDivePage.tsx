import { useMemo, useState } from "react";
import { getFgSkuAction } from "../analytics/actions";
import { buildParetoRows } from "../analytics/aggregations";
import { currency, percent, wholeNumber } from "../analytics/formatters";
import { ActionBadge } from "../components/ActionBadge";
import { DataTable, type DataTableColumn } from "../components/DataTable";
import { KpiCard } from "../components/KpiCard";
import { MetricSwitch } from "../components/MetricSwitch";
import { BubbleChart } from "../components/charts/BubbleChart";
import { ParetoChart } from "../components/charts/ParetoChart";
import type { FgSkuRecord, MetricKey, ProductRecord } from "../domain/types";
import { emptyReason, getProductMetricValue, metricFormatter, metricLabel, metricOptions } from "./pageHelpers";

interface FgSkuDeepDivePageProps {
  products: ProductRecord[];
  benchmarkProducts: ProductRecord[];
  fgSkus: FgSkuRecord[];
  selectedProductName: string;
}

const findSelectedProduct = (products: ProductRecord[], productName: string) => {
  const query = productName.trim().toLowerCase();
  if (!query) return undefined;
  return products.find((product) => product.productLvl1.toLowerCase() === query) ?? (products.length === 1 ? products[0] : undefined);
};

export function FgSkuDeepDivePage({ products, benchmarkProducts, fgSkus, selectedProductName }: FgSkuDeepDivePageProps) {
  const [metric, setMetric] = useState<MetricKey>("value");
  const [selectedSkuId, setSelectedSkuId] = useState<string | null>(null);
  const selectedProduct = findSelectedProduct(products, selectedProductName);
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
  const brandProducts = selectedProduct ? benchmarkProducts.filter((product) => product.brand === selectedProduct.brand) : [];
  const brandMetricTotal = brandProducts.reduce((sum, product) => sum + getProductMetricValue(product, metric), 0);
  const selectedMetricValue = selectedProduct ? getProductMetricValue(selectedProduct, metric) : 0;
  const metricRank = selectedProduct
    ? [...brandProducts].sort((a, b) => getProductMetricValue(b, metric) - getProductMetricValue(a, metric)).findIndex((product) => product.id === selectedProduct.id) + 1
    : 0;
  const brandSkuBenchmark = brandProducts.length ? brandProducts.reduce((sum, product) => sum + product.skuCount, 0) / brandProducts.length : 0;
  const brandFlaBenchmark = brandProducts.length ? brandProducts.reduce((sum, product) => sum + product.flaCount, 0) / brandProducts.length : 0;
  const columns: Array<DataTableColumn<(typeof rows)[number]>> = [
    { key: "skuCode", header: "SKU Code", sticky: true, stickyOffset: 0, value: (row) => row.skuCode, sortValue: (row) => row.skuCode },
    { key: "sku", header: "SKU Name", sticky: true, stickyOffset: 142, value: (row) => row.skuName, sortValue: (row) => row.skuName },
    { key: "lifecycle", header: "Lifecycle", value: (row) => row.lifecycle, sortValue: (row) => row.lifecycle },
    { key: "size", header: "Size", value: (row) => row.size, sortValue: (row) => row.size },
    { key: "fla", header: "FLA", value: (row) => row.fla, sortValue: (row) => row.fla },
    { key: "flaCount", header: "FLA Count", align: "right", value: (row) => row.flaCount, sortValue: (row) => row.flaCount },
    { key: "value", header: "Sales Value", align: "right", value: (row) => currency.format(row.value), sortValue: (row) => row.value },
    { key: "units", header: "Units", align: "right", value: (row) => wholeNumber.format(row.units), sortValue: (row) => row.units },
    { key: "gm", header: "Indicative GM", align: "right", value: (row) => currency.format(row.indicativeGm), sortValue: (row) => row.indicativeGm },
    { key: "gmPct", header: "Indicative GM %", align: "right", value: (row) => percent.format(row.indicativeGmPct), sortValue: (row) => row.indicativeGmPct },
    { key: "rsp", header: "RSP", align: "right", value: (row) => currency.format(row.rsp), sortValue: (row) => row.rsp },
    { key: "cogs", header: "COGS", align: "right", value: (row) => currency.format(row.map), sortValue: (row) => row.map },
    { key: "cogsRate", header: "COGS per ml/kg", align: "right", value: (row) => currency.format(row.cogsPerMlKg), sortValue: (row) => row.cogsPerMlKg },
    { key: "action", header: "Suggested action", value: (row) => <ActionBadge action={row.recommendation.action} />, sortValue: (row) => row.recommendation.action },
    { key: "reason", header: "Reason", value: (row) => <span className={row.recommendation.reason ? "" : "empty-reason"}>{emptyReason(row.recommendation.reason)}</span>, sortValue: (row) => row.recommendation.reason },
  ];

  if (!selectedProduct) {
    return (
      <main className="page">
        <section className="empty-state">
          <strong>Select one Product L1</strong>
          <span>Use the Product L1 filter above to open FG SKU detail. The page stays empty until a single product is selected.</span>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="kpi-grid">
        <KpiCard label="ABC Type" value={selectedProduct?.abcCategory ?? "-"} />
        <KpiCard label="FG SKU Count" value={wholeNumber.format(rows.length)} context={`Brand benchmark ${brandSkuBenchmark.toFixed(1)}`} />
        <KpiCard label="FG FLA Count" value={wholeNumber.format(selectedProduct?.flaCount ?? 0)} context={`Brand benchmark ${brandFlaBenchmark.toFixed(1)}`} />
        <KpiCard tone="fg" label="Products in brand benchmark" value={wholeNumber.format(brandProducts.length)} context={selectedProduct.brand} />
        <KpiCard group="value" label={`${metricLabel[metric]} absolute`} value={metricFormatter(metric)(selectedMetricValue)} />
        <KpiCard group="value" label={`${metricLabel[metric]} contribution to brand`} value={percent.format(brandMetricTotal ? selectedMetricValue / brandMetricTotal : 0)} />
        <KpiCard group="value" label={`${metricLabel[metric]} rank`} value={metricRank ? `${metricRank}/${brandProducts.length}` : "-"} />
        <div className="kpi-card kpi-control-card">
          <MetricSwitch label="X-axis & KPI metric" value={metric} options={metricOptions} onChange={setMetric} />
        </div>
      </section>
      <section className="split-grid">
        <div className="chart-panel">
          <h3>{metricLabel[metric]} Pareto by SKU</h3>
          <ParetoChart
            rows={skuPareto}
            valueFormatter={metricFormatter(metric)}
            measureLabel={metricLabel[metric]}
            selectedId={selectedSkuId}
            onSelectRow={setSelectedSkuId}
            onClearSelection={() => setSelectedSkuId(null)}
          />
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
            selectedId={selectedSkuId}
            onSelectRow={setSelectedSkuId}
            onClearSelection={() => setSelectedSkuId(null)}
          />
        </div>
      </section>
      <section className="data-panel">
        <DataTable
          columns={columns}
          rows={rows}
          getRowId={(row) => row.id}
          exportFilename="fg-sku-deep-dive-table"
          selectedRowId={selectedSkuId}
          selectionLabel="Clear selected SKU"
          onClearSelection={() => setSelectedSkuId(null)}
        />
      </section>
    </main>
  );
}
