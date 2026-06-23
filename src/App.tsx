import { useMemo, useState } from "react";
import { filterFgSkus, filterPlvSkus, filterProducts, uniqueValues, defaultFilters } from "./analytics/filters";
import { AppShell } from "./components/AppShell";
import { FilterBar } from "./components/FilterBar";
import { ScopeDrawer } from "./components/ScopeDrawer";
import { mockFgSkus, mockPlvSkus, mockProducts } from "./data/mockData";
import type { DashboardPageId, FilterState } from "./domain/types";
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
  const filteredProducts = useMemo(() => filterProducts(mockProducts, filters), [filters]);
  const benchmarkProducts = useMemo(() => filterProducts(mockProducts, { ...filters, productSearch: "" }), [filters]);
  const filteredFgSkus = useMemo(() => filterFgSkus(mockFgSkus, mockProducts, filters), [filters]);
  const filteredPlvSkus = useMemo(() => filterPlvSkus(mockPlvSkus, mockProducts, filters), [filters]);
  const showProductSearch = currentPageId === "fg-sku-deep-dive" || currentPageId === "plv-sku-deep-dive";
  const timePeriods = uniqueValues(mockProducts, (row) => row.timePeriod);
  const channels = uniqueValues(mockProducts, (row) => row.channelLvl1);
  const brands = uniqueValues(mockProducts, (row) => row.brand);
  const categories = uniqueValues(mockProducts, (row) => row.category);
  const productOptions = uniqueValues(
    filterProducts(mockProducts, { ...filters, productSearch: "" }),
    (row) => row.productLvl1,
  );
  const filterFieldsByPage: Partial<
    Record<DashboardPageId, Array<"timePeriod" | "channelLvl1" | "brand" | "category" | "lifecycle" | "abcCategory" | "productSearch">>
  > = {
    "core-tail": ["timePeriod", "channelLvl1", "brand", "category", "abcCategory"],
    "fg-variety": ["timePeriod", "channelLvl1", "brand", "category", "abcCategory"],
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
  const openProductDeepDive = (pageId: DashboardPageId, productName: string) => {
    setFilters((current) => ({ ...current, productSearch: productName }));
    setCurrentPageId(pageId);
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
      return <FgSkuDeepDivePage products={filteredProducts} benchmarkProducts={benchmarkProducts} fgSkus={filteredFgSkus} selectedProductName={filters.productSearch} />;
    }
    if (currentPageId === "plv-support") {
      return <PlvSupportPage products={filteredProducts} onOpenProduct={(product) => openProductDeepDive("plv-sku-deep-dive", product)} />;
    }
    if (currentPageId === "sample-complexity") {
      return <SampleComplexityPage products={filteredProducts} onOpenProduct={(product) => openProductDeepDive("plv-sku-deep-dive", product)} />;
    }
    return <PlvSkuDeepDivePage products={filteredProducts} benchmarkProducts={benchmarkProducts} plvSkus={filteredPlvSkus} selectedProductName={filters.productSearch} />;
  };
  const currentScope = scopeByPage[currentPageId];

  return (
    <AppShell currentPageId={currentPageId} onNavigate={setCurrentPageId} onClearFilters={() => setFilters(defaultFilters)}>
      {currentPageId !== "overview" ? (
        <FilterBar
          filters={filters}
          onChange={setFilters}
          showProductSearch={showProductSearch}
          fields={filterFieldsByPage[currentPageId]}
          timePeriods={timePeriods}
          brands={brands}
          categories={categories}
          channels={channels}
          productOptions={productOptions}
          action={currentScope ? <ScopeDrawer title={currentScope.title} sections={currentScope.sections} /> : null}
        />
      ) : null}
      {renderPage()}
    </AppShell>
  );
}
