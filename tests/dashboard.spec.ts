import { expect, test } from "@playwright/test";

test("dashboard navigation, filters, and scope drawer work", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Dashboard pages" });
  await expect(page.getByRole("heading", { name: "Assortment Optimization Analytics", exact: true })).toBeVisible();
  await expect(page.getByLabel("Time period")).toBeHidden();

  await nav.getByRole("button", { name: "Core vs. Tail", exact: true }).click();
  await expect(nav.getByRole("button", { name: "Core vs. Tail", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByText("Identify where the portfolio makes money")).toBeVisible();
  await expect(page.getByLabel("Time period")).toBeVisible();
  await expect(page.getByRole("combobox", { name: "ABC Type" })).toBeVisible();
  await expect(page.getByText(/contributing the first 60% of Sales Value/)).toBeVisible();

  await page.getByRole("button", { name: /scope & definitions/i }).click();
  await expect(page.getByRole("dialog")).toContainText("Indicative GM = FG Sales Value - FG COGS - PLV/PLS COGS");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});

test("sticky filters remain visible after scroll", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Dashboard pages" });
  await nav.getByRole("button", { name: "PLV SKU Deep Dive", exact: true }).click();
  await page.getByLabel("Product L1").fill("Hydra Serum");
  await page.mouse.wheel(0, 1200);
  await expect(page.getByLabel("Time period")).toBeVisible();
  await expect(page.getByText("Channel coverage matrix")).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "SKU Code" })).toBeVisible();
});
