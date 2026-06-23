import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { RangeSlider } from "../RangeSlider";
import { linearScale, paddedExtent, ticks } from "./chartUtils";
import { downloadExcel } from "../../utils/download";

interface ScatterChartProps {
  rows: Array<{ id: string; label: string; x: number; y: number; group?: string; details?: Record<string, string | number> }>;
  xLabel: string;
  yLabel: string;
  reviewZoneLabel?: string;
  xFormatter: (value: number) => string;
  yFormatter: (value: number) => string;
  exportFilename?: string;
  selectedId?: string | null;
  onSelectRow?: (id: string) => void;
  onClearSelection?: () => void;
}

const clampRange = (low: number, high: number) =>
  low >= high ? ([Math.max(0, high - 1), high] as const) : ([low, high] as const);

export function ScatterChart({
  rows,
  xLabel,
  yLabel,
  xFormatter,
  yFormatter,
  exportFilename = "scatter-chart",
  selectedId,
  onSelectRow,
  onClearSelection,
}: ScatterChartProps) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    row: ScatterChartProps["rows"][number];
  } | null>(null);
  const [xWindow, setXWindow] = useState<[number, number]>([0, 100]);
  const [yWindow, setYWindow] = useState<[number, number]>([0, 100]);
  const width = 760;
  const height = 360;
  const pad = { top: 28, right: 38, bottom: 56, left: 72 };
  const innerWidth = width - pad.left - pad.right;
  const innerHeight = height - pad.top - pad.bottom;
  const fullXDomain = paddedExtent(rows.map((row) => row.x));
  const fullYDomain = paddedExtent(rows.map((row) => row.y));
  const toDomain = (domain: readonly [number, number], window: [number, number]) => {
    const [low, high] = clampRange(window[0], window[1]);
    const span = domain[1] - domain[0];
    return [domain[0] + span * (low / 100), domain[0] + span * (high / 100)] as const;
  };
  const xDomain = useMemo(() => toDomain(fullXDomain, xWindow), [fullXDomain, xWindow]);
  const yDomain = useMemo(() => toDomain(fullYDomain, yWindow), [fullYDomain, yWindow]);
  const visibleRows = rows.filter((row) => row.x >= xDomain[0] && row.x <= xDomain[1] && row.y >= yDomain[0] && row.y <= yDomain[1]);
  const xScale = linearScale(xDomain, [pad.left, pad.left + innerWidth]);
  const yScale = linearScale(yDomain, [pad.top + innerHeight, pad.top]);
  const xMid = pad.left + innerWidth / 2;
  const yMid = pad.top + innerHeight / 2;
  const exportRows = visibleRows.map((row) => ({
    Label: row.label,
    [xLabel]: row.x,
    [yLabel]: row.y,
    Group: row.group ?? "",
    ...row.details,
  }));

  return (
    <div className="chart-figure">
      <div className="chart-actions">
        {selectedId ? (
          <button className="selection-clear" type="button" onClick={onClearSelection}>
            <X size={14} aria-hidden="true" />
            Clear selection
          </button>
        ) : null}
        <button type="button" onClick={() => downloadExcel(exportFilename, exportRows)}>
          Export Excel
        </button>
      </div>
      <div className="scatter-plot-shell">
        <RangeSlider
          label="Y range"
          low={yWindow[0]}
          high={yWindow[1]}
          minLabel={yFormatter(yDomain[0])}
          maxLabel={yFormatter(yDomain[1])}
          onChange={setYWindow}
          orientation="vertical"
        />
        <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="scatter-title scatter-desc">
        <title id="scatter-title">Scatter chart</title>
        <desc id="scatter-desc">{`${xLabel} plotted against ${yLabel}`}</desc>
        <rect className="review-zone" x={pad.left} y={pad.top} width={innerWidth / 2} height={innerHeight / 2} />
        <line x1={pad.left} x2={pad.left + innerWidth} y1={pad.top + innerHeight} y2={pad.top + innerHeight} />
        <line x1={pad.left} x2={pad.left} y1={pad.top} y2={pad.top + innerHeight} />
        <line className="guide-line" x1={xMid} x2={xMid} y1={pad.top} y2={pad.top + innerHeight} />
        <line className="guide-line" x1={pad.left} x2={pad.left + innerWidth} y1={yMid} y2={yMid} />
        {ticks(xDomain).map((tick) => (
          <g key={`x-${tick}`}>
            <line className="tick-line" x1={xScale(tick)} x2={xScale(tick)} y1={pad.top + innerHeight} y2={pad.top + innerHeight + 5} />
            <text x={xScale(tick)} y={pad.top + innerHeight + 20} textAnchor="middle">{xFormatter(tick)}</text>
          </g>
        ))}
        {ticks(yDomain).map((tick) => (
          <g key={`y-${tick}`}>
            <line className="tick-line" x1={pad.left - 5} x2={pad.left} y1={yScale(tick)} y2={yScale(tick)} />
            <text x={pad.left - 9} y={yScale(tick) + 4} textAnchor="end">{yFormatter(tick)}</text>
          </g>
        ))}
        {visibleRows.map((row) => {
          const cx = xScale(row.x);
          const cy = yScale(row.y);
          const selected = selectedId === row.id;
          return (
            <g
              key={row.id}
              className={`scatter-point point-${row.group ?? "neutral"}${selected ? " is-selected" : ""}`}
              data-testid="scatter-point"
              onClick={() => onSelectRow?.(row.id)}
              onPointerEnter={() => setTooltip({ x: (cx / width) * 100, y: (cy / height) * 100, row })}
              onPointerMove={() => setTooltip({ x: (cx / width) * 100, y: (cy / height) * 100, row })}
              onPointerLeave={() => setTooltip(null)}
            >
              <circle cx={cx} cy={cy} r={selected ? 8 : 6} />
            </g>
          );
        })}
        <text x={pad.left + innerWidth / 2} y={height - 12} textAnchor="middle">{xLabel}</text>
        <text x={18} y={pad.top + innerHeight / 2} textAnchor="middle" transform={`rotate(-90 18 ${pad.top + innerHeight / 2})`}>{yLabel}</text>
        </svg>
      </div>
      {tooltip ? (
        <div className="chart-tooltip" style={{ left: `${tooltip.x}%`, top: `${tooltip.y}%` }}>
          <strong>{tooltip.row.label}</strong>
          <span>{xLabel}: {xFormatter(tooltip.row.x)}</span>
          <span>{yLabel}: {yFormatter(tooltip.row.y)}</span>
          {Object.entries(tooltip.row.details ?? {}).map(([key, value]) => (
            <span key={key}>{key}: {value}</span>
          ))}
        </div>
      ) : null}
      <RangeSlider
        label="X range"
        low={xWindow[0]}
        high={xWindow[1]}
        minLabel={xFormatter(xDomain[0])}
        maxLabel={xFormatter(xDomain[1])}
        onChange={setXWindow}
      />
    </div>
  );
}
