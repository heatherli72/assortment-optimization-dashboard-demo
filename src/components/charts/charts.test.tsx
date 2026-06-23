import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { ParetoChart } from "./ParetoChart";
import { ScatterChart } from "./ScatterChart";
import { linearScale } from "./chartUtils";

test("linearScale maps values across ranges", () => {
  expect(linearScale([0, 100], [0, 10])(50)).toBe(5);
});

test("ParetoChart renders one bar per row", () => {
  render(
    <ParetoChart
      valueFormatter={(value) => String(value)}
      rows={[
        { id: "a", label: "A", value: 10, cumulativeContribution: 0.6, segment: "A" },
        { id: "b", label: "B", value: 5, cumulativeContribution: 1, segment: "C" },
      ]}
    />,
  );
  expect(screen.getAllByTestId("pareto-bar")).toHaveLength(2);
});

test("ScatterChart renders labels and axis names", () => {
  render(
    <ScatterChart
      xFormatter={String}
      yFormatter={String}
      xLabel="Value"
      yLabel="SKU Count"
      rows={[{ id: "a", label: "Hydra Serum", x: 10, y: 2 }]}
    />,
  );
  expect(screen.getByText("Hydra Serum")).toBeInTheDocument();
  expect(screen.getByText("Value")).toBeInTheDocument();
  expect(screen.getByText("SKU Count")).toBeInTheDocument();
});
