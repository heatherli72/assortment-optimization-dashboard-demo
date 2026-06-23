import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Filter, X } from "lucide-react";
import { downloadExcel } from "../utils/download";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  sticky?: boolean;
  stickyOffset?: number;
  value: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
}

interface DataTableProps<T> {
  columns: Array<DataTableColumn<T>>;
  rows: T[];
  getRowId: (row: T) => string;
  exportFilename?: string;
  selectedRowId?: string | null;
  selectionLabel?: string;
  onClearSelection?: () => void;
}

interface ColumnFilterState {
  search: string;
  values: string[];
}

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  exportFilename = "dashboard-table",
  selectedRowId,
  selectionLabel = "Selected row",
  onClearSelection,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState(columns[0]?.key ?? "");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [columnOrder, setColumnOrder] = useState(columns.map((column) => column.key));
  const [tableSearch, setTableSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<Record<string, ColumnFilterState>>({});
  const [openFilterKey, setOpenFilterKey] = useState<string | null>(null);
  const [draggedKey, setDraggedKey] = useState<string | null>(null);
  const orderedColumns = useMemo(
    () =>
      columnOrder
        .map((key) => columns.find((column) => column.key === key))
        .filter((column): column is DataTableColumn<T> => Boolean(column)),
    [columnOrder, columns],
  );

  const getCellText = (row: T, column: DataTableColumn<T>) => {
    const rendered = column.value(row);
    if (typeof rendered === "string" || typeof rendered === "number") return String(rendered);
    const sortable = column.sortValue?.(row);
    return sortable === undefined ? "" : String(sortable);
  };

  const columnValues = useMemo(
    () =>
      Object.fromEntries(
        orderedColumns.map((column) => [
          column.key,
          Array.from(new Set(rows.map((row) => getCellText(row, column)).filter(Boolean))).sort((a, b) =>
            a.localeCompare(b),
          ),
        ]),
      ) as Record<string, string[]>,
    [orderedColumns, rows],
  );

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        if (selectedRowId && getRowId(row) !== selectedRowId) return false;
        const query = tableSearch.trim().toLowerCase();
        if (
          query &&
          !orderedColumns.some((column) => getCellText(row, column).toLowerCase().includes(query))
        ) {
          return false;
        }
        return orderedColumns.every((column) => {
          const filter = columnFilters[column.key];
          if (!filter) return true;
          const value = getCellText(row, column).toLowerCase();
          if (filter.search.trim() && !value.includes(filter.search.trim().toLowerCase())) return false;
          if (filter.values.length && !filter.values.includes(getCellText(row, column))) return false;
          return true;
        });
      }),
    [columnFilters, getRowId, orderedColumns, rows, selectedRowId, tableSearch],
  );

  const sortedRows = useMemo(() => {
    const column = orderedColumns.find((item) => item.key === sortKey);
    if (!column?.sortValue) return filteredRows;
    return [...filteredRows].sort((a, b) => {
      const left = column.sortValue?.(a) ?? "";
      const right = column.sortValue?.(b) ?? "";
      const result =
        typeof left === "number" && typeof right === "number"
          ? left - right
          : String(left).localeCompare(String(right));
      return direction === "asc" ? result : -result;
    });
  }, [direction, filteredRows, orderedColumns, sortKey]);

  const moveColumn = (targetKey: string) => {
    if (!draggedKey || draggedKey === targetKey) return;
    setColumnOrder((current) => {
      const next = current.filter((key) => key !== draggedKey);
      const targetIndex = next.indexOf(targetKey);
      next.splice(targetIndex, 0, draggedKey);
      return next;
    });
    setDraggedKey(null);
  };

  const exportRows = sortedRows.map((row) =>
    Object.fromEntries(
      orderedColumns.map((column) => {
        return [column.header, getCellText(row, column)];
      }),
    ),
  );
  const updateColumnFilter = (key: string, patch: Partial<ColumnFilterState>) =>
    setColumnFilters((current) => {
      const existing = current[key] ?? { search: "", values: [] };
      return {
        ...current,
        [key]: { ...existing, ...patch },
      };
    });
  const toggleFilterValue = (key: string, value: string) =>
    setColumnFilters((current) => {
      const existing = current[key] ?? { search: "", values: [] };
      const values = existing.values.includes(value)
        ? existing.values.filter((item) => item !== value)
        : [...existing.values, value];
      return { ...current, [key]: { ...existing, values } };
    });
  const clearColumnFilter = (key: string) =>
    setColumnFilters((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });

  return (
    <div className="data-table-shell">
      <div className="table-tools">
        <label>
          Search table
          <input
            value={tableSearch}
            onChange={(event) => setTableSearch(event.target.value)}
            placeholder="Search any column"
          />
        </label>
        {selectedRowId ? (
          <button className="selection-clear" type="button" onClick={onClearSelection}>
            <X size={14} aria-hidden="true" />
            {selectionLabel}
          </button>
        ) : null}
        <button type="button" onClick={() => downloadExcel(exportFilename, exportRows)}>
          Export Excel
        </button>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {orderedColumns.map((column) => (
                <th
                  key={column.key}
                  className={`align-${column.align ?? "left"}${column.sticky ? " sticky-column" : ""}`}
                  draggable
                  onDragStart={() => setDraggedKey(column.key)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => moveColumn(column.key)}
                  title="Drag to reorder column"
                  style={column.sticky ? { left: column.stickyOffset ?? 0 } : undefined}
                >
                  <div className="column-head">
                    {column.sortValue ? (
                      <button
                        aria-label={`Sort by ${column.header}`}
                        type="button"
                        onClick={() => {
                          if (sortKey === column.key) {
                            setDirection(direction === "asc" ? "desc" : "asc");
                          } else {
                            setSortKey(column.key);
                            setDirection("desc");
                          }
                        }}
                      >
                        {column.header}
                        {sortKey === column.key ? <span aria-hidden="true">{direction === "asc" ? " ↑" : " ↓"}</span> : null}
                      </button>
                    ) : (
                      <span>{column.header}</span>
                    )}
                    <button
                      aria-label={`Filter ${column.header}`}
                      className={columnFilters[column.key] ? "filter-trigger active" : "filter-trigger"}
                      type="button"
                      onClick={() => setOpenFilterKey(openFilterKey === column.key ? null : column.key)}
                    >
                      <Filter size={13} aria-hidden="true" />
                    </button>
                  </div>
                  {openFilterKey === column.key ? (
                    <div className="column-filter-menu">
                      <input
                        aria-label={`Search ${column.header}`}
                        value={columnFilters[column.key]?.search ?? ""}
                        onChange={(event) => updateColumnFilter(column.key, { search: event.target.value })}
                        placeholder="Type to search"
                      />
                      <div className="filter-values">
                        {columnValues[column.key].slice(0, 18).map((value) => (
                          <label key={value}>
                            <input
                              checked={(columnFilters[column.key]?.values ?? []).includes(value)}
                              type="checkbox"
                              onChange={() => toggleFilterValue(column.key, value)}
                            />
                            <span>{value}</span>
                          </label>
                        ))}
                      </div>
                      <button type="button" onClick={() => clearColumnFilter(column.key)}>
                        Clear filter
                      </button>
                    </div>
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => (
              <tr key={getRowId(row)}>
                {orderedColumns.map((column) => (
                  <td
                    key={column.key}
                    className={`align-${column.align ?? "left"}${column.sticky ? " sticky-column" : ""}`}
                    style={column.sticky ? { left: column.stickyOffset ?? 0 } : undefined}
                  >
                    {column.value(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
