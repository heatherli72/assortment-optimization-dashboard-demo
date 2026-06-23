import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

test("ParetoChart exposes cutoff labels, export, and hover detail", async () => {
  render(
    <ParetoChart
      measureLabel="Sales value"
      valueFormatter={(value) => `$${value}`}
      rows={[
        { id: "a", label: "Hero Product", value: 60, contribution: 0.6, cumulativeContribution: 0.6, segment: "A" },
        { id: "b", label: "Tail Product", value: 30, contribution: 0.3, cumulativeContribution: 0.9, segment: "B" },
      ]}
    />,
  );

  expect(screen.getByText("60% cut-off")).toBeInTheDocument();
  expect(screen.getByText("90% cut-off")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Export Excel" })).toBeInTheDocument();

  await userEvent.hover(screen.getAllByTestId("pareto-bar")[0]);
  expect(screen.getByText("Sales value: $60")).toBeInTheDocument();
  expect(screen.getByText("Measure contribution: 60.0%")).toBeInTheDocument();
});

test("ScatterChart renders axis names and hover-only point detail", async () => {
  render(
    <ScatterChart
      xFormatter={String}
      yFormatter={String}
      xLabel="Value"
      yLabel="SKU Count"
      rows={[{ id: "a", label: "Hydra Serum", x: 10, y: 2 }]}
    />,
  );
  expect(screen.getByText("Value")).toBeInTheDocument();
  expect(screen.getByText("SKU Count")).toBeInTheDocument();
  await userEvent.hover(screen.getByTestId("scatter-point"));
  expect(screen.getByText("Hydra Serum")).toBeInTheDocument();
});
