interface MatrixChartProps {
  rows: string[];
  columns: string[];
  activeCells: Array<{ row: string; column: string; tone: "keep" | "review" | "simplify" }>;
}

export function MatrixChart({ rows, columns, activeCells }: MatrixChartProps) {
  const lookup = new Map(activeCells.map((cell) => [`${cell.row}::${cell.column}`, cell.tone]));

  return (
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
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
