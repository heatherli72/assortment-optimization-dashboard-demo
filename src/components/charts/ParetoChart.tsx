interface ParetoChartProps {
  rows: Array<{
    id: string;
    label: string;
    value: number;
    contribution?: number;
    cumulativeContribution: number;
    segment: "A" | "B" | "C";
  }>;
  valueFormatter: (value: number) => string;
}

const segmentClass = { A: "segment-a", B: "segment-b", C: "segment-c" } as const;

export function ParetoChart({ rows, valueFormatter }: ParetoChartProps) {
  const width = 860;
  const height = 320;
  const pad = { top: 24, right: 40, bottom: 72, left: 52 };
  const innerWidth = width - pad.left - pad.right;
  const innerHeight = height - pad.top - pad.bottom;
  const maxValue = Math.max(...rows.map((row) => row.value), 1);
  const barWidth = rows.length ? innerWidth / rows.length - 6 : innerWidth;
  const points = rows
    .map((row, index) => {
      const x = pad.left + index * (innerWidth / rows.length) + barWidth / 2;
      const y = pad.top + innerHeight * (1 - row.cumulativeContribution);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="pareto-title pareto-desc">
      <title id="pareto-title">Pareto chart</title>
      <desc id="pareto-desc">Bars show product contribution and line shows cumulative contribution.</desc>
      <line x1={pad.left} x2={pad.left + innerWidth} y1={pad.top + innerHeight} y2={pad.top + innerHeight} />
      {rows.map((row, index) => {
        const barHeight = (row.value / maxValue) * innerHeight;
        const x = pad.left + index * (innerWidth / rows.length);
        const y = pad.top + innerHeight - barHeight;
        return (
          <g key={row.id}>
            <rect
              className={`pareto-bar ${segmentClass[row.segment]}`}
              data-testid="pareto-bar"
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx="4"
            />
            <title>{`${row.label}
Value: ${valueFormatter(row.value)}
Contribution: ${((row.contribution ?? 0) * 100).toFixed(1)}%
Cumulative: ${(row.cumulativeContribution * 100).toFixed(1)}%
ABC: ${row.segment}`}</title>
            <text x={x + barWidth / 2} y={height - 36} textAnchor="end" transform={`rotate(-34 ${x + barWidth / 2} ${height - 36})`}>
              {row.label}
            </text>
            <text x={x + barWidth / 2} y={Math.max(16, y - 6)} textAnchor="middle">
              {valueFormatter(row.value)}
            </text>
          </g>
        );
      })}
      <polyline className="pareto-line" fill="none" points={points} />
      {rows.map((row, index) => {
        const x = pad.left + index * (innerWidth / rows.length) + barWidth / 2;
        const y = pad.top + innerHeight * (1 - row.cumulativeContribution);
        return <circle key={`${row.id}-point`} className="pareto-point" cx={x} cy={y} r="4" />;
      })}
      <text x={width - 138} y={18}>Cumulative line</text>
    </svg>
  );
}
