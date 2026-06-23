import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { ActionBadge } from "./ActionBadge";
import { DataTable } from "./DataTable";
import { KpiCard } from "./KpiCard";
import { MetricSwitch } from "./MetricSwitch";

describe("shared dashboard components", () => {
  test("renders KPI content", () => {
    render(<KpiCard label="Total products" value="12" context="All products" />);
    expect(screen.getByText("Total products")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("All products")).toBeInTheDocument();
  });

  test("metric switch calls onChange", async () => {
    const onChange = vi.fn();
    render(
      <MetricSwitch
        label="Metric"
        value="value"
        options={[
          { value: "value", label: "Value" },
          { value: "units", label: "Units" },
        ]}
        onChange={onChange}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Units" }));
    expect(onChange).toHaveBeenCalledWith("units");
  });

  test("data table sorts numeric values", async () => {
    render(
      <DataTable
        getRowId={(row) => row.name}
        rows={[
          { name: "B", value: 2 },
          { name: "A", value: 8 },
        ]}
        columns={[
          { key: "name", header: "Name", value: (row) => row.name },
          { key: "value", header: "Value", value: (row) => row.value, sortValue: (row) => row.value },
        ]}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /Sort by Value/i }));
    const cells = screen.getAllByRole("cell").map((cell) => cell.textContent);
    expect(cells.slice(0, 2)).toEqual(["A", "8"]);
  });

  test("data table searches across columns", async () => {
    render(
      <DataTable
        getRowId={(row) => row.name}
        rows={[
          { name: "Hydra Serum", value: 8 },
          { name: "Repair Cream", value: 2 },
        ]}
        columns={[
          { key: "name", header: "Name", value: (row) => row.name, sortValue: (row) => row.name },
          { key: "value", header: "Value", value: (row) => row.value, sortValue: (row) => row.value },
        ]}
      />,
    );

    await userEvent.type(screen.getByLabelText("Search table"), "Hydra");
    expect(screen.getByText("Hydra Serum")).toBeInTheDocument();
    expect(screen.queryByText("Repair Cream")).not.toBeInTheDocument();
  });

  test("action badges render accessible action labels", () => {
    render(
      <>
        <ActionBadge action="Keep" />
        <ActionBadge action="Review" />
        <ActionBadge action="Simplify" />
      </>,
    );

    expect(screen.getByText("Keep")).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();
    expect(screen.getByText("Simplify")).toBeInTheDocument();
  });
});
