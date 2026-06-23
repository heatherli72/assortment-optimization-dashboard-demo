export function extent(values: number[]) {
  if (!values.length) return [0, 1] as const;
  return [Math.min(...values), Math.max(...values)] as const;
}

export function paddedExtent(values: number[], pad = 0.08) {
  const [min, max] = extent(values);
  if (min === max) return [Math.max(0, min - 1), max + 1] as const;
  const delta = (max - min) * pad;
  return [Math.max(0, min - delta), max + delta] as const;
}

export function linearScale(domain: readonly [number, number], range: readonly [number, number]) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  if (d0 === d1) return () => (r0 + r1) / 2;
  return (value: number) => r0 + ((value - d0) / (d1 - d0)) * (r1 - r0);
}

export function ticks(domain: readonly [number, number], count = 5) {
  const [min, max] = domain;
  if (count <= 1 || min === max) return [min];
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, index) => min + step * index);
}
