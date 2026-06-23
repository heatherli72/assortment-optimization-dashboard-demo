import type { FilterState, Lifecycle } from "../domain/types";

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  showProductSearch: boolean;
  fields?: Array<"timePeriod" | "channelLvl1" | "brand" | "category" | "lifecycle" | "productSearch">;
  timePeriods: string[];
  brands: string[];
  categories: string[];
  channels: string[];
}

const lifecycles: Array<"All" | Lifecycle> = ["All", "Core", "Growth", "Mature", "Tail", "Exit"];

export function FilterBar({
  filters,
  onChange,
  showProductSearch,
  fields = ["timePeriod", "channelLvl1", "brand", "category", "lifecycle"],
  timePeriods,
  brands,
  categories,
  channels,
}: FilterBarProps) {
  const update = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch });
  const visible = new Set(fields);

  return (
    <section className="filter-bar" aria-label="Dashboard filters">
      {visible.has("timePeriod") ? <label>
        Time period
        <select value={filters.timePeriod} onChange={(event) => update({ timePeriod: event.target.value })}>
          <option>All</option>
          {timePeriods.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label> : null}
      {visible.has("channelLvl1") ? <label>
        Channel lvl1
        <select value={filters.channelLvl1} onChange={(event) => update({ channelLvl1: event.target.value })}>
          <option>All</option>
          {channels.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label> : null}
      {visible.has("brand") ? <label>
        Brand
        <select value={filters.brand} onChange={(event) => update({ brand: event.target.value })}>
          <option>All</option>
          {brands.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label> : null}
      {visible.has("category") ? <label>
        Category
        <select value={filters.category} onChange={(event) => update({ category: event.target.value })}>
          <option>All</option>
          {categories.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label> : null}
      {visible.has("lifecycle") ? <label>
        Product lifecycle
        <select value={filters.lifecycle} onChange={(event) => update({ lifecycle: event.target.value as FilterState["lifecycle"] })}>
          {lifecycles.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label> : null}
      {showProductSearch && visible.has("productSearch") ? (
        <label className="filter-search">
          Product search
          <input
            value={filters.productSearch}
            onChange={(event) => update({ productSearch: event.target.value })}
            placeholder="Search product"
          />
        </label>
      ) : null}
    </section>
  );
}
