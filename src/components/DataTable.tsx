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

  const sortedRows = useMemo(() => {
    const column = columns.find((item) => item.key === sortKey);
    if (!column?.sortValue) return rows;
    return [...rows].sort((a, b) => {
      const left = column.sortValue?.(a) ?? "";
      const right = column.sortValue?.(b) ?? "";
      const result =
        typeof left === "number" && typeof right === "number"
          ? left - right
          : String(left).localeCompare(String(right));
      return direction === "asc" ? result : -result;
    });
  }, [columns, direction, rows, sortKey]);

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={`align-${column.align ?? "left"}`}>
                {column.sortValue ? (
                  <button
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
                  </button>
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row) => (
            <tr key={getRowId(row)}>
              {columns.map((column) => (
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
