import { useMemo, useState } from "react";
import { filterFgSkus, filterPlvSkus, filterProducts, uniqueValues, defaultFilters } from "./analytics/filters";
import { AppShell } from "./components/AppShell";
import { FilterBar } from "./components/FilterBar";
import { mockFgSkus, mockPlvSkus, mockProducts } from "./data/mockData";
import type { DashboardPageId, FilterState } from "./domain/types";
import { CoreTailPage } from "./pages/CoreTailPage";
import { FgSkuDeepDivePage } from "./pages/FgSkuDeepDivePage";
import { FgVarietyPage } from "./pages/FgVarietyPage";
import { OverviewPage } from "./pages/OverviewPage";
import { PlvSkuDeepDivePage } from "./pages/PlvSkuDeepDivePage";
import { PlvSupportPage } from "./pages/PlvSupportPage";
import { SampleComplexityPage } from "./pages/SampleComplexityPage";

export default function App() {
  const [currentPageId, setCurrentPageId] = useState<DashboardPageId>("overview");
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const filteredProducts = useMemo(() => filterProducts(mockProducts, filters), [filters]);
  const filteredFgSkus = useMemo(() => filterFgSkus(mockFgSkus, mockProducts, filters), [filters]);
  const filteredPlvSkus = useMemo(() => filterPlvSkus(mockPlvSkus, mockProducts, filters), [filters]);
  const showProductSearch = currentPageId === "fg-sku-deep-dive" || currentPageId === "plv-sku-deep-dive";
  const timePeriods = uniqueValues(mockProducts, (row) => row.timePeriod);
  const channels = uniqueValues(mockProducts, (row) => row.channelLvl1);
  const brands = uniqueValues(mockProducts, (row) => row.brand);
  const categories = uniqueValues(mockProducts, (row) => row.category);
  const filterFieldsByPage: Partial<
    Record<DashboardPageId, Array<"timePeriod" | "channelLvl1" | "brand" | "category" | "lifecycle" | "productSearch">>
  > = {
    "core-tail": ["timePeriod", "channelLvl1", "brand", "category", "lifecycle"],
    "fg-variety": ["timePeriod", "brand", "category", "lifecycle"],
    "fg-sku-deep-dive": ["timePeriod", "brand", "category", "lifecycle", "productSearch"],
    "plv-support": ["timePeriod", "channelLvl1", "brand", "category"],
    "sample-complexity": ["timePeriod", "brand", "category"],
    "plv-sku-deep-dive": ["timePeriod", "brand", "category", "productSearch"],
  };

  const renderPage = () => {
    if (currentPageId === "overview") return <OverviewPage onNavigate={setCurrentPageId} />;
    if (currentPageId === "core-tail") return <CoreTailPage products={filteredProducts} fgSkus={filteredFgSkus} />;
    if (currentPageId === "fg-variety") return <FgVarietyPage products={filteredProducts} />;
    if (currentPageId === "fg-sku-deep-dive") {
      return <FgSkuDeepDivePage products={filteredProducts} fgSkus={filteredFgSkus} />;
    }
    if (currentPageId === "plv-support") return <PlvSupportPage products={filteredProducts} />;
    if (currentPageId === "sample-complexity") return <SampleComplexityPage products={filteredProducts} />;
    return <PlvSkuDeepDivePage products={filteredProducts} plvSkus={filteredPlvSkus} />;
  };

  return (
    <AppShell currentPageId={currentPageId} onNavigate={setCurrentPageId}>
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
        />
      ) : null}
      {renderPage()}
    </AppShell>
  );
}
