import { useState } from "react";
import { X } from "lucide-react";
import { RangeSlider } from "../RangeSlider";
import { downloadExcel } from "../../utils/download";

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
  exportFilename?: string;
  measureLabel?: string;
  selectedId?: string | null;
  onSelectRow?: (id: string) => void;
  onClearSelection?: () => void;
}

const segmentClass = { A: "segment-a", B: "segment-b", C: "segment-c" } as const;

export function ParetoChart({
  rows,
  valueFormatter,
  exportFilename = "pareto-chart",
  measureLabel = "Measure",
  selectedId,
  onSelectRow,
  onClearSelection,
}: ParetoChartProps) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    row: ParetoChartProps["rows"][number];
  } | null>(null);
  const [visibleRange, setVisibleRange] = useState<[number, number]>([0, Math.max(rows.length - 1, 0)]);
  const width = 860;
  const height = 320;
  const pad = { top: 34, right: 40, bottom: 30, left: 52 };
  const rangeStart = Math.min(visibleRange[0], Math.max(rows.length - 1, 0));
  const rangeEnd = Math.max(rangeStart, Math.min(visibleRange[1], Math.max(rows.length - 1, 0)));
  const visibleRows = rows.slice(rangeStart, rangeEnd + 1);
  const innerWidth = width - pad.left - pad.right;
  const innerHeight = height - pad.top - pad.bottom;
  const maxValue = Math.max(...visibleRows.map((row) => row.value), 1);
  const barWidth = visibleRows.length ? innerWidth / visibleRows.length - 6 : innerWidth;
  const slotWidth = visibleRows.length ? innerWidth / visibleRows.length : innerWidth;
  const points = visibleRows
    .map((row, index) => {
      const x = pad.left + index * slotWidth + barWidth / 2;
      const y = pad.top + innerHeight * (1 - row.cumulativeContribution);
      return `${x},${y}`;
    })
    .join(" ");
  const cutoffX = (cutoff: number) => {
    const index = visibleRows.findIndex((row) => row.cumulativeContribution >= cutoff);
    if (index < 0) return pad.left + innerWidth;
    return pad.left + index * slotWidth + barWidth + 3;
  };
  const exportRows = visibleRows.map((row) => ({
    Product: row.label,
    [measureLabel]: row.value,
    "Measure contribution %": `${((row.contribution ?? 0) * 100).toFixed(1)}%`,
    "Cumulative contribution %": `${(row.cumulativeContribution * 100).toFixed(1)}%`,
    ABC: row.segment,
  }));

  return (
    <div className="chart-figure">
      <div className="chart-actions">
        <div className="pareto-legend" aria-label="ABC color logic">
          <span><i className="legend-a" />A: first 60%</span>
          <span><i className="legend-b" />B: 60-90%</span>
          <span><i className="legend-c" />C: tail</span>
        </div>
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
      <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="pareto-title pareto-desc">
        <title id="pareto-title">Pareto chart</title>
        <desc id="pareto-desc">Bars show product contribution and line shows cumulative contribution.</desc>
        <line x1={pad.left} x2={pad.left + innerWidth} y1={pad.top + innerHeight} y2={pad.top + innerHeight} />
        {[0.6, 0.9].map((cutoff) => {
          const x = cutoffX(cutoff);
          const isRightCutoff = cutoff > 0.8;
          return (
            <g key={cutoff}>
              <line className="cutoff-line" x1={x} x2={x} y1={pad.top} y2={pad.top + innerHeight} />
              <text className="cutoff-label" x={isRightCutoff ? x - 6 : x + 4} y={pad.top + 12} textAnchor={isRightCutoff ? "end" : "start"}>{`${Math.round(cutoff * 100)}% cut-off`}</text>
            </g>
          );
        })}
        {visibleRows.map((row, index) => {
          const barHeight = (row.value / maxValue) * innerHeight;
          const x = pad.left + index * slotWidth;
          const y = pad.top + innerHeight - barHeight;
          const contribution = `${((row.contribution ?? 0) * 100).toFixed(1)}%`;
          const selected = selectedId === row.id;
          return (
            <g
              key={row.id}
              className={selected ? "is-selected" : ""}
              onClick={() => onSelectRow?.(row.id)}
              onPointerEnter={() => setTooltip({ x: ((x + barWidth / 2) / width) * 100, y: (y / height) * 100, row })}
              onPointerMove={() => setTooltip({ x: ((x + barWidth / 2) / width) * 100, y: (y / height) * 100, row })}
              onPointerLeave={() => setTooltip(null)}
            >
              <rect
                className={`pareto-bar ${segmentClass[row.segment]}`}
                data-testid="pareto-bar"
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="4"
              />
              <text className="bar-value-label" x={x + barWidth / 2} y={Math.max(14, y - 15)} textAnchor="middle">
                {valueFormatter(row.value)}
              </text>
              <text className="bar-contribution-label" x={x + barWidth / 2} y={Math.max(26, y - 3)} textAnchor="middle">
                {contribution}
              </text>
            </g>
          );
        })}
        <polyline className="pareto-line" fill="none" points={points} />
        {visibleRows.map((row, index) => {
          const x = pad.left + index * slotWidth + barWidth / 2;
          const y = pad.top + innerHeight * (1 - row.cumulativeContribution);
          return <circle key={`${row.id}-point`} className="pareto-point" cx={x} cy={y} r="4" />;
        })}
        <text x={width - 138} y={18}>Cumulative line</text>
      </svg>
      {tooltip ? (
        <div className="chart-tooltip" style={{ left: `${tooltip.x}%`, top: `${tooltip.y}%` }}>
          <strong>{tooltip.row.label}</strong>
          <span>{measureLabel}: {valueFormatter(tooltip.row.value)}</span>
          <span>Measure contribution: {((tooltip.row.contribution ?? 0) * 100).toFixed(1)}%</span>
          <span>Cumulative contribution: {(tooltip.row.cumulativeContribution * 100).toFixed(1)}%</span>
          <span>ABC: {tooltip.row.segment}</span>
        </div>
      ) : null}
      {rows.length > 1 ? (
        <RangeSlider
          label="Visible products"
          low={rows.length <= 1 ? 0 : (rangeStart / (rows.length - 1)) * 100}
          high={rows.length <= 1 ? 100 : (rangeEnd / (rows.length - 1)) * 100}
          minLabel={`#${rangeStart + 1}`}
          maxLabel={`#${rangeEnd + 1}`}
          onChange={([low, high]) =>
            setVisibleRange([
              Math.floor((low / 100) * (rows.length - 1)),
              Math.ceil((high / 100) * (rows.length - 1)),
            ])
          }
        />
      ) : null}
    </div>
  );
}
