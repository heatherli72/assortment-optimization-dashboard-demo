import { downloadExcel } from "../../utils/download";

interface MatrixChartProps {
  rows: string[];
  columns: string[];
  activeCells: Array<{ row: string; column: string; tone: "keep" | "review" | "simplify" }>;
  exportFilename?: string;
  exportLabel?: string;
}

export function MatrixChart({ rows, columns, activeCells, exportFilename = "matrix-data", exportLabel = "Export matrix data" }: MatrixChartProps) {
  const lookup = new Map(activeCells.map((cell) => [`${cell.row}::${cell.column}`, cell.tone]));
  const exportRows = rows.map((row) => ({
    SKU: row,
    ...Object.fromEntries(columns.map((column) => [column, lookup.has(`${row}::${column}`) ? "Y" : ""])),
  }));

  return (
    <div className="matrix-chart-shell">
      <div className="chart-actions">
        <button type="button" onClick={() => downloadExcel(exportFilename, exportRows)}>
          {exportLabel}
        </button>
      </div>
      <div className="matrix-chart" role="table" aria-label="Coverage matrix">
        <div className="matrix-row matrix-head" role="row">
          <span role="columnheader">SKU</span>
          {columns.map((column) => (
            <span key={column} role="columnheader">{column}</span>
          ))}
        </div>
        {rows.map((row) => (
          <div className="matrix-row" role="row" key={row}>
            <span role="rowheader">{row}</span>
            {columns.map((column) => {
              const tone = lookup.get(`${row}::${column}`);
              return (
                <span
                  key={column}
                  className={tone ? `matrix-cell matrix-${tone}` : "matrix-cell"}
                  role="cell"
                  aria-label={`${row} ${column} ${tone ?? "inactive"}`}
                >
                  {tone ? "Y" : ""}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
