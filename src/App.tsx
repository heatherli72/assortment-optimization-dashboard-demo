import { useMemo, useState } from "react";
import { filterFgSkus, filterPlvSkus, filterProducts, uniqueValues, defaultFilters } from "./analytics/filters";
import { AppShell } from "./components/AppShell";
import { FilterBar } from "./components/FilterBar";
import { ScopeDrawer } from "./components/ScopeDrawer";
import { realFgSkus, realPlvSkus, realProducts } from "./data/realData";
import type { DashboardPageId, FgSkuRecord, FilterState, PlvSkuRecord, ProductRecord } from "./domain/types";
import { CoreTailPage, coreTailScopeSections } from "./pages/CoreTailPage";
import { FgSkuDeepDivePage } from "./pages/FgSkuDeepDivePage";
import { FgVarietyPage } from "./pages/FgVarietyPage";
import { OverviewPage } from "./pages/OverviewPage";
import { PlvSkuDeepDivePage } from "./pages/PlvSkuDeepDivePage";
import { PlvSupportPage } from "./pages/PlvSupportPage";
import { SampleComplexityPage } from "./pages/SampleComplexityPage";
import { fgScopeSections, fgSkuScopeSections, plvScopeSections, plvSkuScopeSections } from "./pages/pageHelpers";

export default function App() {
  const [currentPageId, setCurrentPageId] = useState<DashboardPageId>("overview");
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [deepDiveProductSearch, setDeepDiveProductSearch] = useState("");
  const benchmarkProducts = useMemo(() => filterProducts(realProducts, { ...filters, productSearch: "" }), [filters]);
  const showProductSearch = currentPageId === "fg-sku-deep-dive" || currentPageId === "plv-sku-deep-dive";
  const activeFilters = useMemo(
    () => ({ ...filters, productSearch: showProductSearch ? deepDiveProductSearch : "" }),
    [deepDiveProductSearch, filters, showProductSearch],
  );
  const filteredProducts = useMemo(() => filterProducts(realProducts, activeFilters), [activeFilters]);
  const filteredFgSkus = useMemo(() => filterFgSkus(realFgSkus, realProducts, activeFilters), [activeFilters]);
  const filteredPlvSkus = useMemo(() => filterPlvSkus(realPlvSkus, realProducts, activeFilters), [activeFilters]);
  const timePeriods = uniqueValues(realProducts, (row) => row.timePeriod).filter((value) => value !== "All");
  const channels = uniqueValues(realProducts, (row) => row.channelLvl1).filter((value) => value !== "All");
  const brands = uniqueValues(realProducts, (row) => row.brand);
  const categories = uniqueValues(realProducts, (row) => row.category);
  const lifecycleRows: Array<ProductRecord | FgSkuRecord | PlvSkuRecord> =
    currentPageId === "fg-sku-deep-dive" ? realFgSkus : currentPageId === "plv-sku-deep-dive" ? realPlvSkus : realProducts;
  const lifecycles = uniqueValues(lifecycleRows, (row) => row.lifecycle).filter((value) => value !== "All");
  const productOptions = uniqueValues(
    filterProducts(realProducts, { ...filters, lifecycle: [], productSearch: "" }),
    (row) => row.productLvl1,
  );
  const filterFieldsByPage: Partial<
    Record<DashboardPageId, Array<"timePeriod" | "channelLvl1" | "brand" | "category" | "lifecycle" | "abcCategory" | "productSearch">>
  > = {
    "core-tail": ["timePeriod", "channelLvl1", "brand", "category", "abcCategory", "lifecycle"],
    "fg-variety": ["timePeriod", "channelLvl1", "brand", "category", "abcCategory", "lifecycle"],
    "fg-sku-deep-dive": ["timePeriod", "channelLvl1", "brand", "category", "abcCategory", "lifecycle", "productSearch"],
    "plv-support": ["timePeriod", "channelLvl1", "brand", "category", "abcCategory", "lifecycle"],
    "sample-complexity": ["timePeriod", "channelLvl1", "brand", "category", "abcCategory", "lifecycle"],
    "plv-sku-deep-dive": ["timePeriod", "channelLvl1", "brand", "category", "abcCategory", "lifecycle", "productSearch"],
  };
  const scopeByPage: Partial<Record<DashboardPageId, { title: string; sections: Array<{ heading: string; body: string[] }> }>> = {
    "core-tail": { title: "Core vs. Tail scope", sections: coreTailScopeSections },
    "fg-variety": { title: "FG Variety vs. Value scope", sections: fgScopeSections },
    "fg-sku-deep-dive": { title: "FG SKU Deep Dive scope", sections: fgSkuScopeSections },
    "plv-support": { title: "PLV Support scope", sections: plvScopeSections },
    "sample-complexity": { title: "PLV Complexity scope", sections: plvScopeSections },
    "plv-sku-deep-dive": { title: "PLV SKU Deep Dive scope", sections: plvSkuScopeSections },
  };
  const updateFilters = (nextFilters: FilterState) => {
    setFilters(nextFilters);
  };
  const openProductDeepDive = (pageId: DashboardPageId, product: ProductRecord) => {
    setSelectedProductId(product.id);
    setDeepDiveProductSearch(product.productLvl1);
    setCurrentPageId(pageId);
  };
  const updateDeepDiveProductSearch = (value: string) => {
    setDeepDiveProductSearch(value);
    setSelectedProductId("");
  };

  const renderPage = () => {
    if (currentPageId === "overview") return <OverviewPage onNavigate={setCurrentPageId} />;
    if (currentPageId === "core-tail") {
      return <CoreTailPage products={filteredProducts} fgSkus={filteredFgSkus} onOpenProduct={(product) => openProductDeepDive("fg-sku-deep-dive", product)} />;
    }
    if (currentPageId === "fg-variety") {
      return <FgVarietyPage products={filteredProducts} onOpenProduct={(product) => openProductDeepDive("fg-sku-deep-dive", product)} />;
    }
    if (currentPageId === "fg-sku-deep-dive") {
      return <FgSkuDeepDivePage products={filteredProducts} benchmarkProducts={benchmarkProducts} fgSkus={filteredFgSkus} selectedProductId={selectedProductId} selectedProductName={deepDiveProductSearch} />;
    }
    if (currentPageId === "plv-support") {
      return <PlvSupportPage products={filteredProducts} onOpenProduct={(product) => openProductDeepDive("plv-sku-deep-dive", product)} />;
    }
    if (currentPageId === "sample-complexity") {
      return <SampleComplexityPage products={filteredProducts} onOpenProduct={(product) => openProductDeepDive("plv-sku-deep-dive", product)} />;
    }
    return <PlvSkuDeepDivePage products={filteredProducts} benchmarkProducts={benchmarkProducts} plvSkus={filteredPlvSkus} selectedProductId={selectedProductId} selectedProductName={deepDiveProductSearch} />;
  };
  const currentScope = scopeByPage[currentPageId];

  return (
    <AppShell
      currentPageId={currentPageId}
      onNavigate={setCurrentPageId}
      onClearFilters={() => {
        setSelectedProductId("");
        setDeepDiveProductSearch("");
        setFilters(defaultFilters);
      }}
    >
      {currentPageId !== "overview" ? (
        <FilterBar
          filters={filters}
          onChange={updateFilters}
          showProductSearch={showProductSearch}
          fields={filterFieldsByPage[currentPageId]}
          timePeriods={timePeriods}
          brands={brands}
          categories={categories}
          channels={channels}
          lifecycles={lifecycles}
          productOptions={productOptions}
          productSearchValue={deepDiveProductSearch}
          onProductSearchChange={updateDeepDiveProductSearch}
          onClearProductSearch={() => updateDeepDiveProductSearch("")}
          action={currentScope ? <ScopeDrawer title={currentScope.title} sections={currentScope.sections} /> : null}
        />
      ) : null}
      {renderPage()}
    </AppShell>
  );
}
