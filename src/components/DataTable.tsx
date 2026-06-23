import type { ReactNode } from "react";
import { useMemo, useState } from "react";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  value: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
}

interface DataTableProps<T> {
  columns: Array<DataTableColumn<T>>;
  rows: T[];
  getRowId: (row: T) => string;
}

export function DataTable<T>({ columns, rows, getRowId }: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState(columns[0]?.key ?? "");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [columnOrder, setColumnOrder] = useState(columns.map((column) => column.key));
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [draggedKey, setDraggedKey] = useState<string | null>(null);
  const orderedColumns = useMemo(
    () =>
      columnOrder
        .map((key) => columns.find((column) => column.key === key))
        .filter((column): column is DataTableColumn<T> => Boolean(column)),
    [columnOrder, columns],
  );

  const filteredRows = useMemo(
    () =>
      rows.filter((row) =>
        orderedColumns.every((column) => {
          const query = filters[column.key]?.trim().toLowerCase();
          if (!query) return true;
          const raw = column.sortValue?.(row) ?? column.value(row);
          return String(raw).toLowerCase().includes(query);
        }),
      ),
    [filters, orderedColumns, rows],
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

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {orderedColumns.map((column) => (
              <th
                key={column.key}
                className={`align-${column.align ?? "left"}`}
                draggable
                onDragStart={() => setDraggedKey(column.key)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => moveColumn(column.key)}
              >
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
                  column.header
                )}
                <input
                  aria-label={`Filter ${column.header}`}
                  className="column-filter"
                  value={filters[column.key] ?? ""}
                  onChange={(event) => setFilters((current) => ({ ...current, [column.key]: event.target.value }))}
                  placeholder="Filter"
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row) => (
            <tr key={getRowId(row)}>
              {orderedColumns.map((column) => (
                <td key={column.key} className={`align-${column.align ?? "left"}`}>
                  {column.value(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
