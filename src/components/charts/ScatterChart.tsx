import { linearScale, paddedExtent } from "./chartUtils";

interface ScatterChartProps {
  rows: Array<{ id: string; label: string; x: number; y: number; group?: string; details?: Record<string, string | number> }>;
  xLabel: string;
  yLabel: string;
  reviewZoneLabel?: string;
  xFormatter: (value: number) => string;
  yFormatter: (value: number) => string;
}

export function ScatterChart({ rows, xLabel, yLabel, reviewZoneLabel, xFormatter, yFormatter }: ScatterChartProps) {
  const width = 760;
  const height = 360;
  const pad = { top: 28, right: 38, bottom: 56, left: 72 };
  const innerWidth = width - pad.left - pad.right;
  const innerHeight = height - pad.top - pad.bottom;
  const xScale = linearScale(paddedExtent(rows.map((row) => row.x)), [pad.left, pad.left + innerWidth]);
  const yScale = linearScale(paddedExtent(rows.map((row) => row.y)), [pad.top + innerHeight, pad.top]);
  const xMid = pad.left + innerWidth / 2;
  const yMid = pad.top + innerHeight / 2;

  return (
    <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="scatter-title scatter-desc">
      <title id="scatter-title">Scatter chart</title>
      <desc id="scatter-desc">{`${xLabel} plotted against ${yLabel}`}</desc>
      <rect className="review-zone" x={xMid} y={pad.top} width={innerWidth / 2} height={innerHeight / 2} />
      <line x1={pad.left} x2={pad.left + innerWidth} y1={pad.top + innerHeight} y2={pad.top + innerHeight} />
      <line x1={pad.left} x2={pad.left} y1={pad.top} y2={pad.top + innerHeight} />
      <line className="guide-line" x1={xMid} x2={xMid} y1={pad.top} y2={pad.top + innerHeight} />
      <line className="guide-line" x1={pad.left} x2={pad.left + innerWidth} y1={yMid} y2={yMid} />
      {reviewZoneLabel ? <text className="zone-label" x={xMid + 12} y={pad.top + 20}>{reviewZoneLabel}</text> : null}
      {rows.map((row) => {
        const cx = xScale(row.x);
        const cy = yScale(row.y);
        return (
          <g key={row.id} className={`scatter-point point-${row.group ?? "neutral"}`}>
            <circle cx={cx} cy={cy} r="6" />
            <text x={cx + 8} y={cy - 8}>{row.label}</text>
            <title>{[
              row.label,
              `${xLabel}: ${xFormatter(row.x)}`,
              `${yLabel}: ${yFormatter(row.y)}`,
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
