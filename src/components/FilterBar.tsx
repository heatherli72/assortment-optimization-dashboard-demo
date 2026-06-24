import type { ReactNode } from "react";
import { X } from "lucide-react";
import type { AbcCategory, FilterState } from "../domain/types";

type FilterField = "timePeriod" | "channelLvl1" | "brand" | "category" | "lifecycle" | "abcCategory" | "productSearch";

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  showProductSearch: boolean;
  fields?: FilterField[];
  timePeriods: string[];
  brands: string[];
  categories: string[];
  channels: string[];
  lifecycles: string[];
  productOptions?: string[];
  productSearchValue: string;
  onProductSearchChange: (value: string) => void;
  onClearProductSearch: () => void;
  action?: ReactNode;
}

const abcTypes: AbcCategory[] = ["A", "B", "C"];

function valueSummary(values: string[]) {
  if (!values.length) return "All";
  if (values.length === 1) return values[0];
  return `${values.length} selected`;
}

function MultiSelectFilter({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const toggle = (option: string) =>
    onChange(value.includes(option) ? value.filter((item) => item !== option) : [...value, option]);

  return (
    <details className="multi-filter">
      <summary aria-label={`${label} filter`}>
        <span>{label}</span>
        <b>{valueSummary(value)}</b>
      </summary>
      <div className="multi-filter-menu">
        <button type="button" onClick={() => onChange([])}>
          All
        </button>
        {options.length ? (
          options.map((option) => (
            <label key={option}>
              <input checked={value.includes(option)} type="checkbox" onChange={() => toggle(option)} />
              <span>{option}</span>
            </label>
          ))
        ) : (
          <p>All</p>
        )}
      </div>
    </details>
  );
}

export function FilterBar({
  filters,
  onChange,
  showProductSearch,
  fields = ["timePeriod", "channelLvl1", "brand", "category", "lifecycle"],
  timePeriods,
  brands,
  categories,
  channels,
  lifecycles,
  productOptions = [],
  productSearchValue,
  onProductSearchChange,
  onClearProductSearch,
  action,
}: FilterBarProps) {
  const update = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch });
  const visible = new Set(fields);

  return (
    <section className="filter-bar" aria-label="Dashboard filters">
      {visible.has("timePeriod") ? <MultiSelectFilter label="Time period" options={timePeriods} value={filters.timePeriod} onChange={(value) => update({ timePeriod: value })} /> : null}
      {visible.has("channelLvl1") ? <MultiSelectFilter label="Channel L1" options={channels} value={filters.channelLvl1} onChange={(value) => update({ channelLvl1: value })} /> : null}
      {visible.has("brand") ? <MultiSelectFilter label="Brand" options={brands} value={filters.brand} onChange={(value) => update({ brand: value })} /> : null}
      {visible.has("category") ? <MultiSelectFilter label="Category" options={categories} value={filters.category} onChange={(value) => update({ category: value })} /> : null}
      {visible.has("lifecycle") ? <MultiSelectFilter label="Lifecycle" options={lifecycles} value={filters.lifecycle} onChange={(value) => update({ lifecycle: value })} /> : null}
      {visible.has("abcCategory") ? <MultiSelectFilter label="ABC Type" options={abcTypes} value={filters.abcCategory} onChange={(value) => update({ abcCategory: value as AbcCategory[] })} /> : null}
      {showProductSearch && visible.has("productSearch") ? (
        <label className="filter-search">
          Product L1
          <span className="filter-search-input">
            <input
              list="product-l1-options"
              value={productSearchValue}
              onChange={(event) => onProductSearchChange(event.target.value)}
              placeholder="Select or search Product L1"
            />
            {productSearchValue ? (
              <button aria-label="Clear Product L1 filter" type="button" onClick={onClearProductSearch}>
                <X size={14} aria-hidden="true" />
              </button>
            ) : null}
          </span>
          <datalist id="product-l1-options">
            {productOptions.map((product) => (
              <option key={product} value={product} />
            ))}
          </datalist>
        </label>
      ) : null}
      {action ? <div className="filter-action-slot">{action}</div> : null}
    </section>
  );
}
