import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import App from "../App";

test("overview renders framework questions and page cards", () => {
  render(<App />);

  expect(screen.getByText("Where is the Money?")).toBeInTheDocument();
  expect(screen.getByText("Is Complexity Justified?")).toBeInTheDocument();
  expect(screen.getByText("What Should We Keep, Review, or Simplify?")).toBeInTheDocument();
  expect(within(screen.getByLabelText("Analytics framework")).getAllByRole("button")).toHaveLength(6);
});

test("FG Variety defaults to Value and SKU Count", async () => {
  render(<App />);
  await userEvent.click(within(screen.getByRole("navigation", { name: "Dashboard pages" })).getByRole("button", { name: "FG Variety vs. Value" }));

  expect(screen.getByRole("heading", { name: "FG SKU Count vs. Sales Value" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Sales Value", pressed: true })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "SKU Count", pressed: true })).toBeInTheDocument();
});

test("PLV Support default y-axis is PLV Units over total units", async () => {
  render(<App />);
  await userEvent.click(within(screen.getByRole("navigation", { name: "Dashboard pages" })).getByRole("button", { name: "PLV Support vs. FG Sales" }));

  expect(screen.getByRole("button", { name: "PLV Units / Total Product Units", pressed: true })).toBeInTheDocument();
});

test("Sample Complexity page includes both demand and channel coverage scatters", async () => {
  render(<App />);
  await userEvent.click(within(screen.getByRole("navigation", { name: "Dashboard pages" })).getByRole("button", { name: "PLV Complexity vs. Demand" }));

  expect(screen.getByText(/PLV SKU Count vs. PLV Units/i)).toBeInTheDocument();
  expect(screen.getByText(/PLV SKU Count vs. Channel distribution/i)).toBeInTheDocument();
});

test("deep dive pages include action and reason columns", async () => {
  render(<App />);
  const nav = within(screen.getByRole("navigation", { name: "Dashboard pages" }));
  await userEvent.click(nav.getByRole("button", { name: "FG SKU Deep Dive" }));
  await userEvent.type(screen.getByLabelText("Product L1"), "Hydra Serum");

  expect(screen.getByRole("columnheader", { name: "Suggested action" })).toBeInTheDocument();
  expect(screen.getByRole("columnheader", { name: "Reason" })).toBeInTheDocument();
  expect(screen.getAllByText(/Keep|Review|Simplify/).length).toBeGreaterThan(0);

  await userEvent.click(nav.getByRole("button", { name: "PLV SKU Deep Dive" }));
  expect(screen.getByRole("columnheader", { name: "Suggested action" })).toBeInTheDocument();
  expect(screen.getByRole("columnheader", { name: "Reason" })).toBeInTheDocument();
  expect(screen.getByText("Channel coverage matrix")).toBeInTheDocument();
  expect(screen.getAllByText(/Retail -/).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Sachet|Deluxe Sample|Travel Size/).length).toBeGreaterThan(0);
});

test("Core vs. Tail controls KPI and chart metric and exposes brand contribution fields", async () => {
  render(<App />);
  await userEvent.click(within(screen.getByRole("navigation", { name: "Dashboard pages" })).getByRole("button", { name: "Core vs. Tail" }));

  expect(screen.getByLabelText("KPI & chart metric")).toBeInTheDocument();
  expect(screen.getByText(/contributing the first 60% of Sales Value/)).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Units" }));
  expect(screen.getByText(/contributing the first 60% of Units/)).toBeInTheDocument();
  expect(screen.getByRole("columnheader", { name: /Units contribution to brand/i })).toBeInTheDocument();
  expect(screen.getByRole("columnheader", { name: /Indicative GM contribution to brand/i })).toBeInTheDocument();
  expect(screen.getByRole("columnheader", { name: /Min RSP/i })).toBeInTheDocument();
  expect(screen.getByRole("columnheader", { name: /Max COGS/i })).toBeInTheDocument();
});
