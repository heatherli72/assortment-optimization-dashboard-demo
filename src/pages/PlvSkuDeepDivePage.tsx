import { useMemo, useState } from "react";
import { getPlvSkuAction } from "../analytics/actions";
import { currency, wholeNumber } from "../analytics/formatters";
import { ActionBadge } from "../components/ActionBadge";
import { DataTable, type DataTableColumn } from "../components/DataTable";
import { KpiCard } from "../components/KpiCard";
import { ScopeDrawer } from "../components/ScopeDrawer";
import { BubbleChart } from "../components/charts/BubbleChart";
import { MatrixChart } from "../components/charts/MatrixChart";
import { ParetoChart } from "../components/charts/ParetoChart";
import type { ParetoRow } from "../analytics/aggregations";
import type { PlvSkuRecord, ProductRecord } from "../domain/types";
import { emptyReason, plvScopeSections } from "./pageHelpers";

interface PlvSkuDeepDivePageProps {
  products: ProductRecord[];
  plvSkus: PlvSkuRecord[];
}

export function PlvSkuDeepDivePage({ products, plvSkus }: PlvSkuDeepDivePageProps) {
  const productsWithPlv = products.filter((product) => plvSkus.some((sku) => sku.productId === product.id));
  const defaultProduct =
    productsWithPlv.find((product) =>
      plvSkus
        .filter((sku) => sku.productId === product.id)
        .some((sku, _, siblings) => getPlvSkuAction(sku, product, siblings).action === "Simplify"),
    ) ?? productsWithPlv[0];
  const [selectedProductId, setSelectedProductId] = useState(defaultProduct?.id ?? "");
  const selectedProduct = productsWithPlv.find((product) => product.id === selectedProductId) ?? defaultProduct;
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
  let cumulative = 0;
  const paretoRows: ParetoRow[] = [...rows]
    .sort((a, b) => b.units - a.units)
    .map((sku) => {
      const contribution = totalUnits ? sku.units / totalUnits : 0;
      cumulative += contribution;
      return {
        id: sku.id,
        label: sku.skuName,
        value: sku.units,
        contribution,
        cumulativeContribution: Math.min(cumulative, 1),
        segment: cumulative <= 0.6 ? "A" : cumulative <= 0.9 ? "B" : "C",
      };
    });
  const channels = Array.from(new Set(rows.flatMap((sku) => sku.channelLvl2Covered))).sort();
  const sampleTypes = Array.from(new Set(rows.map((sku) => sku.sampleType))).sort();
  const toneFor = (action: string) =>
    action === "Keep" ? "keep" : action === "Simplify" ? "simplify" : "review";
  const columns: Array<DataTableColumn<(typeof rows)[number]>> = [
    { key: "sku", header: "SKU", value: (row) => row.skuName, sortValue: (row) => row.skuName },
    { key: "type", header: "Sample type", value: (row) => row.sampleType, sortValue: (row) => row.sampleType },
    { key: "size", header: "Size", value: (row) => row.size, sortValue: (row) => row.size },
    { key: "fla", header: "FLA Count", align: "right", value: (row) => row.flaCount, sortValue: (row) => row.flaCount },
    { key: "units", header: "PLV Units", align: "right", value: (row) => wholeNumber.format(row.units), sortValue: (row) => row.units },
    { key: "cost", header: "PLV Cost", align: "right", value: (row) => currency.format(row.cost), sortValue: (row) => row.cost },
    { key: "cogs", header: "COGS per ml/kg", align: "right", value: (row) => currency.format(row.cogsPerMlKg), sortValue: (row) => row.cogsPerMlKg },
    { key: "coverage", header: "Channel lvl2 coverage", value: (row) => row.channelLvl2Covered.join(", "), sortValue: (row) => row.channelLvl2Covered.length },
    { key: "action", header: "Suggested action", value: (row) => <ActionBadge action={row.recommendation.action} />, sortValue: (row) => row.recommendation.action },
    { key: "reason", header: "Reason", value: (row) => <span className={row.recommendation.reason ? "" : "empty-reason"}>{emptyReason(row.recommendation.reason)}</span>, sortValue: (row) => row.recommendation.reason },
  ];

  return (
    <main className="page">
      <section className="page-title">
        <p className="eyebrow">Decision this page supports</p>
        <h2>PLV SKU Deep Dive</h2>
        <p>Identify overlapping, costly, or low-demand PLV SKUs to keep, review, or simplify.</p>
      </section>
      <div className="toolbar-row">
        <label className="inline-select">
          Product
          <select value={selectedProduct?.id ?? ""} onChange={(event) => setSelectedProductId(event.target.value)}>
            {productsWithPlv.map((product) => (
              <option key={product.id} value={product.id}>{product.productLvl1}</option>
            ))}
          </select>
        </label>
        <ScopeDrawer title="PLV SKU Deep Dive scope" sections={plvScopeSections} />
      </div>
      <section className="kpi-grid">
        <KpiCard tone="plv" label="Selected product" value={selectedProduct?.productLvl1 ?? "No product"} context={selectedProduct?.brand} />
        <KpiCard label="PLV SKUs" value={wholeNumber.format(rows.length)} />
        <KpiCard label="PLV units" value={wholeNumber.format(totalUnits)} />
        <KpiCard label="Simplify candidates" value={wholeNumber.format(rows.filter((row) => row.recommendation.action === "Simplify").length)} />
      </section>
      <section className="split-grid">
        <div className="chart-panel">
          <h3>PLV Units Pareto by SKU</h3>
          <ParetoChart rows={paretoRows} valueFormatter={wholeNumber.format} />
        </div>
        <div className="chart-panel">
          <h3>PLV Units vs COGS per ml/kg</h3>
          <BubbleChart
            rows={rows.map((sku) => ({ id: sku.id, label: sku.skuCode, x: sku.units, y: sku.cogsPerMlKg, size: sku.flaCount }))}
            xLabel="PLV Units"
            yLabel="COGS per ml/kg"
            xFormatter={wholeNumber.format}
            yFormatter={(value) => currency.format(value)}
          />
        </div>
      </section>
      <section className="split-grid">
        <div className="chart-panel">
          <h3>Channel coverage matrix</h3>
          <MatrixChart
            rows={rows.map((sku) => sku.skuCode)}
            columns={channels}
            activeCells={rows.flatMap((sku) =>
              sku.channelLvl2Covered.map((column) => ({
                row: sku.skuCode,
                column,
                tone: toneFor(sku.recommendation.action) as "keep" | "review" | "simplify",
              })),
            )}
          />
        </div>
        <div className="chart-panel">
          <h3>Sample type matrix</h3>
          <MatrixChart
            rows={rows.map((sku) => sku.skuCode)}
            columns={sampleTypes}
            activeCells={rows.map((sku) => ({
              row: sku.skuCode,
              column: sku.sampleType,
              tone: toneFor(sku.recommendation.action) as "keep" | "review" | "simplify",
            }))}
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
