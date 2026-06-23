import { useState } from "react";
import { X } from "lucide-react";
import { extent, linearScale, paddedExtent } from "./chartUtils";
import { downloadExcel } from "../../utils/download";

interface BubbleChartProps {
  rows: Array<{ id: string; label: string; x: number; y: number; size: number; details?: Record<string, string | number> }>;
  xLabel: string;
  yLabel: string;
  xFormatter: (value: number) => string;
  yFormatter: (value: number) => string;
  exportFilename?: string;
  selectedId?: string | null;
  onSelectRow?: (id: string) => void;
  onClearSelection?: () => void;
}

export function BubbleChart({ rows, xLabel, yLabel, xFormatter, yFormatter, exportFilename = "bubble-chart", selectedId, onSelectRow, onClearSelection }: BubbleChartProps) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    row: BubbleChartProps["rows"][number];
  } | null>(null);
  const width = 760;
  const height = 340;
  const pad = { top: 28, right: 38, bottom: 56, left: 72 };
  const innerWidth = width - pad.left - pad.right;
  const innerHeight = height - pad.top - pad.bottom;
  const xScale = linearScale(paddedExtent(rows.map((row) => row.x)), [pad.left, pad.left + innerWidth]);
  const yScale = linearScale(paddedExtent(rows.map((row) => row.y)), [pad.top + innerHeight, pad.top]);
  const sizeScale = linearScale(extent(rows.map((row) => row.size)), [5, 20]);
  const exportRows = rows.map((row) => ({
    Label: row.label,
    [xLabel]: row.x,
    [yLabel]: row.y,
    "FLA Count": row.size,
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
      <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="bubble-title bubble-desc">
        <title id="bubble-title">Bubble chart</title>
        <desc id="bubble-desc">{`${xLabel} plotted against ${yLabel}; bubble size represents FLA count.`}</desc>
        <line x1={pad.left} x2={pad.left + innerWidth} y1={pad.top + innerHeight} y2={pad.top + innerHeight} />
        <line x1={pad.left} x2={pad.left} y1={pad.top} y2={pad.top + innerHeight} />
        {rows.map((row) => {
          const cx = xScale(row.x);
          const cy = yScale(row.y);
          const r = sizeScale(row.size);
          const selected = selectedId === row.id;
          return (
            <g
              key={row.id}
              className={`bubble-point${selected ? " is-selected" : ""}`}
              onClick={() => onSelectRow?.(row.id)}
              onPointerEnter={() => setTooltip({ x: (cx / width) * 100, y: (cy / height) * 100, row })}
              onPointerMove={() => setTooltip({ x: (cx / width) * 100, y: (cy / height) * 100, row })}
              onPointerLeave={() => setTooltip(null)}
            >
              <circle cx={cx} cy={cy} r={selected ? r + 2 : r} />
              <text x={cx + r + 4} y={cy}>{row.label}</text>
            </g>
          );
        })}
        <text x={pad.left + innerWidth / 2} y={height - 12} textAnchor="middle">{xLabel}</text>
        <text x={18} y={pad.top + innerHeight / 2} textAnchor="middle" transform={`rotate(-90 18 ${pad.top + innerHeight / 2})`}>{yLabel}</text>
      </svg>
      {tooltip ? (
        <div className="chart-tooltip" style={{ left: `${tooltip.x}%`, top: `${tooltip.y}%` }}>
          <strong>{tooltip.row.label}</strong>
          <span>{xLabel}: {xFormatter(tooltip.row.x)}</span>
          <span>{yLabel}: {yFormatter(tooltip.row.y)}</span>
          <span>FLA Count: {tooltip.row.size}</span>
          {Object.entries(tooltip.row.details ?? {}).map(([key, value]) => (
            <span key={key}>{key}: {value}</span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
