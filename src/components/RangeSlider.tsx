import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";
import { useRef, useState } from "react";

interface RangeSliderProps {
  label: string;
  low: number;
  high: number;
  onChange: (range: [number, number]) => void;
  orientation?: "horizontal" | "vertical";
  minLabel: string;
  maxLabel: string;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const step = 1;

export function RangeSlider({
  label,
  low,
  high,
  onChange,
  orientation = "horizontal",
  minLabel,
  maxLabel,
}: RangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeHandle, setActiveHandle] = useState<"low" | "high" | null>(null);
  const lowPct = clamp(Math.min(low, high), 0, 100);
  const highPct = clamp(Math.max(low, high), 0, 100);
  const trackStyle = { "--low": `${lowPct}%`, "--high": `${highPct}%` } as CSSProperties;
  const lowHandleStyle = { "--pos": `${lowPct}%` } as CSSProperties;
  const highHandleStyle = { "--pos": `${highPct}%` } as CSSProperties;

  const applyValue = (handle: "low" | "high", value: number) => {
    const next = clamp(Math.round(value), 0, 100);
    if (handle === "low") {
      onChange([clamp(next, 0, highPct - step), highPct]);
    } else {
      onChange([lowPct, clamp(next, lowPct + step, 100)]);
    }
  };

  const valueFromPointer = (event: PointerEvent<HTMLDivElement>) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    if (orientation === "vertical") {
      return clamp(((rect.bottom - event.clientY) / rect.height) * 100, 0, 100);
    }
    return clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100);
  };

  const startDrag = (handle: "low" | "high", event: PointerEvent<HTMLButtonElement | HTMLDivElement>) => {
    event.preventDefault();
    setActiveHandle(handle);
    trackRef.current?.setPointerCapture(event.pointerId);
    if (event.currentTarget === trackRef.current) {
      applyValue(handle, valueFromPointer(event as PointerEvent<HTMLDivElement>));
    }
  };

  const drag = (event: PointerEvent<HTMLDivElement>) => {
    if (!activeHandle) return;
    applyValue(activeHandle, valueFromPointer(event));
  };

  const stopDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setActiveHandle(null);
  };

  const trackPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const value = valueFromPointer(event);
    const handle = Math.abs(value - lowPct) <= Math.abs(value - highPct) ? "low" : "high";
    startDrag(handle, event);
  };

  const keyMove = (handle: "low" | "high", event: KeyboardEvent<HTMLButtonElement>) => {
    const sign = event.key === "ArrowLeft" || event.key === "ArrowDown" ? -1 : event.key === "ArrowRight" || event.key === "ArrowUp" ? 1 : 0;
    const pageSign = event.key === "PageDown" ? -10 : event.key === "PageUp" ? 10 : 0;
    if (event.key === "Home") {
      event.preventDefault();
      applyValue(handle, 0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      applyValue(handle, 100);
      return;
    }
    if (!sign && !pageSign) return;
    event.preventDefault();
    applyValue(handle, (handle === "low" ? lowPct : highPct) + sign + pageSign);
  };

  return (
    <div className={`range-slider range-${orientation}`} aria-label={label}>
      <span>{label}</span>
      <div
        ref={trackRef}
        className="range-track"
        style={trackStyle}
        onPointerDown={trackPointerDown}
        onPointerMove={drag}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
      >
        <button
          aria-label={`${label} minimum`}
          aria-valuemax={Math.round(highPct - step)}
          aria-valuemin={0}
          aria-valuenow={Math.round(lowPct)}
          className="range-handle range-handle-low"
          role="slider"
          style={lowHandleStyle}
          type="button"
          onKeyDown={(event) => keyMove("low", event)}
          onPointerDown={(event) => {
            event.stopPropagation();
            startDrag("low", event);
          }}
        />
        <button
          aria-label={`${label} maximum`}
          aria-valuemax={100}
          aria-valuemin={Math.round(lowPct + step)}
          aria-valuenow={Math.round(highPct)}
          className="range-handle range-handle-high"
          role="slider"
          style={highHandleStyle}
          type="button"
          onKeyDown={(event) => keyMove("high", event)}
          onPointerDown={(event) => {
            event.stopPropagation();
            startDrag("high", event);
          }}
        />
      </div>
      <small>
        {orientation === "vertical" ? (
          <>
            <b>{maxLabel}</b>
            <b>{minLabel}</b>
          </>
        ) : (
          <>
            <b>{minLabel}</b>
            <b>{maxLabel}</b>
          </>
        )}
      </small>
    </div>
  );
}
