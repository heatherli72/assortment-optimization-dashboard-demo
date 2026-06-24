import { useMemo, useState } from "react";
import { getPlvSkuAction } from "../analytics/actions";
import { currency, percent, wholeNumber } from "../analytics/formatters";
import { ActionBadge } from "../components/ActionBadge";
import { DataTable, type DataTableColumn } from "../components/DataTable";
import { KpiCard } from "../components/KpiCard";
import { BubbleChart } from "../components/charts/BubbleChart";
import { MatrixChart } from "../components/charts/MatrixChart";
import { ParetoChart } from "../components/charts/ParetoChart";
import type { ParetoRow } from "../analytics/aggregations";
import type { PlvSkuRecord, ProductRecord } from "../domain/types";
import { emptyReason } from "./pageHelpers";

interface PlvSkuDeepDivePageProps {
  products: ProductRecord[];
  benchmarkProducts: ProductRecord[];
  plvSkus: PlvSkuRecord[];
  selectedProductId: string;
  selectedProductName: string;
}

const findSelectedProduct = (products: ProductRecord[], productId: string, productName: string) => {
  if (productId) {
    const byId = products.find((product) => product.id === productId);
    if (byId) return byId;
  }
  const query = productName.trim().toLowerCase();
  if (!query) return undefined;
  return products.find((product) => product.productLvl1.toLowerCase() === query) ?? (products.length === 1 ? products[0] : undefined);
};

export function PlvSkuDeepDivePage({ products, benchmarkProducts, plvSkus, selectedProductId, selectedProductName }: PlvSkuDeepDivePageProps) {
  const [selectedSkuId, setSelectedSkuId] = useState<string | null>(null);
  const selectedProduct = findSelectedProduct(products, selectedProductId, selectedProductName);
  const productSkus = plvSkus.filter((sku) => sku.productId === selectedProduct?.id);
  const rows = useMemo(
    () =>
      productSkus.map((sku) => ({
        ...sku,
        recommendation: getPlvSkuAction(sku, selectedProduct ?? { plvUnits: 0 }, productSkus),
      })),
    [productSkus, selectedProduct],
  );
  const totalUnits = rows.reduce((sum, row) => sum + row.units, 0);
  const brandProducts = selectedProduct ? benchmarkProducts.filter((product) => product.brand === selectedProduct.brand) : [];
  const brandProductsWithPlv = brandProducts.filter((product) => product.plvSkuCount > 0);
  const brandPlvUnits = brandProducts.reduce((sum, product) => sum + product.plvUnits, 0);
  const brandPlvSkuBenchmark = brandProducts.length ? brandProducts.reduce((sum, product) => sum + product.plvSkuCount, 0) / brandProducts.length : 0;
  const brandPlvFlaBenchmark = brandProducts.length ? brandProducts.reduce((sum, product) => sum + product.plvFlaCount, 0) / brandProducts.length : 0;
  const plvUnitsRank = selectedProduct
    ? [...brandProducts].sort((a, b) => b.plvUnits - a.plvUnits).findIndex((product) => product.id === selectedProduct.id) + 1
    : 0;
  let cumulative = 0;
  const paretoRows: ParetoRow[] = [...rows]
    .sort((a, b) => b.units - a.units)
    .map((sku) => {
      const contribution = totalUnits ? sku.units / totalUnits : 0;
      const segment = cumulative < 0.6 ? "A" : cumulative < 0.9 ? "B" : "C";
      cumulative += contribution;
      return {
        id: sku.id,
        label: sku.skuName,
        value: sku.units,
        contribution,
        cumulativeContribution: Math.min(cumulative, 1),
        segment,
      };
    });
  const channels = Array.from(new Set(rows.flatMap((sku) => sku.channelLvl2Covered))).sort();
  const sampleTypes = Array.from(new Set(rows.map((sku) => sku.sampleType))).sort();
  const columns: Array<DataTableColumn<(typeof rows)[number]>> = [
    { key: "skuCode", header: "SKU Code", sticky: true, stickyOffset: 0, value: (row) => row.skuCode, sortValue: (row) => row.skuCode },
    { key: "sku", header: "SKU Name", sticky: true, stickyOffset: 142, value: (row) => row.skuName, sortValue: (row) => row.skuName },
    { key: "lifecycle", header: "Lifecycle", value: (row) => row.lifecycle, sortValue: (row) => row.lifecycle },
    { key: "type", header: "Sample type", value: (row) => row.sampleType, sortValue: (row) => row.sampleType },
    { key: "size", header: "Size", value: (row) => row.size, sortValue: (row) => row.size },
    { key: "fla", header: "FLA", value: (row) => row.fla, sortValue: (row) => row.fla },
    { key: "flaCount", header: "FLA Count", align: "right", value: (row) => row.flaCount, sortValue: (row) => row.flaCount },
    { key: "units", header: "PLV Units", align: "right", value: (row) => wholeNumber.format(row.units), sortValue: (row) => row.units },
    { key: "unitsShare", header: "PLV Units contribution to brand", align: "right", value: (row) => percent.format(brandPlvUnits ? row.units / brandPlvUnits : 0), sortValue: (row) => brandPlvUnits ? row.units / brandPlvUnits : 0 },
    { key: "cost", header: "PLV COGS", align: "right", value: (row) => currency.format(row.cost), sortValue: (row) => row.cost },
    { key: "cogs", header: "COGS per ml/kg", align: "right", value: (row) => currency.format(row.cogsPerMlKg), sortValue: (row) => row.cogsPerMlKg },
    { key: "coverage", header: "Channel L2 coverage", value: (row) => row.channelLvl2Covered.join(", "), sortValue: (row) => row.channelLvl2Covered.length },
    { key: "action", header: "Suggested action", value: (row) => <ActionBadge action={row.recommendation.action} />, sortValue: (row) => row.recommendation.action },
    { key: "reason", header: "Reason", value: (row) => <span className={row.recommendation.reason ? "" : "empty-reason"}>{emptyReason(row.recommendation.reason)}</span>, sortValue: (row) => row.recommendation.reason },
  ];

  if (!selectedProduct) {
    return (
      <main className="page">
        <section className="empty-state">
          <strong>Select one Product L1</strong>
          <span>Use the Product L1 filter above to open PLV SKU detail. The page stays empty until a single product is selected.</span>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="kpi-grid">
        <KpiCard label="ABC Type" value={selectedProduct?.abcCategory ?? "-"} />
        <KpiCard label="PLV SKU Count" value={wholeNumber.format(rows.length)} context={`Brand benchmark ${brandPlvSkuBenchmark.toFixed(1)}`} />
        <KpiCard label="PLV FLA Count" value={wholeNumber.format(selectedProduct?.plvFlaCount ?? 0)} context={`Brand benchmark ${brandPlvFlaBenchmark.toFixed(1)}`} />
        <KpiCard label="Products with PLV in benchmark brand" value={wholeNumber.format(brandProductsWithPlv.length)} context={selectedProduct.brand} />
        <KpiCard group="volume" label="PLV units contribution to brand" value={percent.format(brandPlvUnits ? (selectedProduct?.plvUnits ?? 0) / brandPlvUnits : 0)} />
        <KpiCard group="volume" label="Units rank out of total brand" value={plvUnitsRank ? `${plvUnitsRank}/${brandProducts.length}` : "-"} />
      </section>
      <section className="split-grid">
        <div className="chart-panel">
          <h3>PLV Units Pareto by SKU</h3>
          <ParetoChart
            rows={paretoRows}
            valueFormatter={wholeNumber.format}
            measureLabel="PLV Units"
            selectedId={selectedSkuId}
            onSelectRow={setSelectedSkuId}
            onClearSelection={() => setSelectedSkuId(null)}
          />
        </div>
        <div className="chart-panel">
          <h3>PLV Units vs COGS per ml/kg</h3>
          <BubbleChart
            rows={rows.map((sku) => ({ id: sku.id, label: sku.skuCode, x: sku.units, y: sku.cogsPerMlKg, size: sku.flaCount }))}
            xLabel="PLV Units"
            yLabel="COGS per ml/kg"
            xFormatter={wholeNumber.format}
            yFormatter={(value) => currency.format(value)}
            selectedId={selectedSkuId}
            onSelectRow={setSelectedSkuId}
            onClearSelection={() => setSelectedSkuId(null)}
          />
        </div>
      </section>
      <section className="split-grid">
        <div className="chart-panel">
          <h3>Channel coverage matrix</h3>
          <MatrixChart
            rows={rows.map((sku) => sku.skuCode)}
            columns={channels}
            exportFilename="plv-channel-coverage-matrix"
            exportLabel="Export Channel coverage data"
            activeCells={rows.flatMap((sku) =>
              sku.channelLvl2Covered.map((column) => ({
                row: sku.skuCode,
                column,
                tone: "keep" as const,
              })),
            )}
          />
        </div>
        <div className="chart-panel">
          <h3>Sample type matrix</h3>
          <MatrixChart
            rows={rows.map((sku) => sku.skuCode)}
            columns={sampleTypes}
            exportFilename="plv-sample-type-matrix"
            exportLabel="Export Sample type data"
            activeCells={rows.map((sku) => ({
              row: sku.skuCode,
              column: sku.sampleType,
              tone: "keep" as const,
            }))}
          />
        </div>
      </section>
      <section className="data-panel">
        <DataTable
          columns={columns}
          rows={rows}
          getRowId={(row) => row.id}
          exportFilename="plv-sku-deep-dive-table"
          selectedRowId={selectedSkuId}
          selectionLabel="Clear selected SKU"
          onClearSelection={() => setSelectedSkuId(null)}
        />
      </section>
    </main>
  );
}
