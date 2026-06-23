import { extent, linearScale, paddedExtent } from "./chartUtils";

interface BubbleChartProps {
  rows: Array<{ id: string; label: string; x: number; y: number; size: number; details?: Record<string, string | number> }>;
  xLabel: string;
  yLabel: string;
  xFormatter: (value: number) => string;
  yFormatter: (value: number) => string;
}

export function BubbleChart({ rows, xLabel, yLabel, xFormatter, yFormatter }: BubbleChartProps) {
  const width = 760;
  const height = 340;
  const pad = { top: 28, right: 38, bottom: 56, left: 72 };
  const innerWidth = width - pad.left - pad.right;
  const innerHeight = height - pad.top - pad.bottom;
  const xScale = linearScale(paddedExtent(rows.map((row) => row.x)), [pad.left, pad.left + innerWidth]);
  const yScale = linearScale(paddedExtent(rows.map((row) => row.y)), [pad.top + innerHeight, pad.top]);
  const sizeScale = linearScale(extent(rows.map((row) => row.size)), [5, 20]);

  return (
    <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="bubble-title bubble-desc">
      <title id="bubble-title">Bubble chart</title>
      <desc id="bubble-desc">{`${xLabel} plotted against ${yLabel}; bubble size represents FLA count.`}</desc>
      <line x1={pad.left} x2={pad.left + innerWidth} y1={pad.top + innerHeight} y2={pad.top + innerHeight} />
      <line x1={pad.left} x2={pad.left} y1={pad.top} y2={pad.top + innerHeight} />
      {rows.map((row) => {
        const cx = xScale(row.x);
        const cy = yScale(row.y);
        const r = sizeScale(row.size);
        return (
          <g key={row.id} className="bubble-point">
            <circle cx={cx} cy={cy} r={r} />
            <text x={cx + r + 4} y={cy}>{row.label}</text>
            <title>{[
              row.label,
              `${xLabel}: ${xFormatter(row.x)}`,
              `${yLabel}: ${yFormatter(row.y)}`,
              `FLA Count: ${row.size}`,
              ...Object.entries(row.details ?? {}).map(([key, value]) => `${key}: ${value}`),
            ].join("\n")}</title>
          </g>
        );
      })}
      <text x={pad.left + innerWidth / 2} y={height - 12} textAnchor="middle">{xLabel}</text>
      <text x={18} y={pad.top + innerHeight / 2} textAnchor="middle" transform={`rotate(-90 18 ${pad.top + innerHeight / 2})`}>{yLabel}</text>
    </svg>
  );
}
