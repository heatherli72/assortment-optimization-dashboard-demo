import { expect, test } from "@playwright/test";

test("dashboard navigation, filters, and scope drawer work", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Dashboard pages" });
  await expect(page.getByRole("heading", { name: "Assortment Optimization", exact: true })).toBeVisible();
  await expect(page.getByLabel("Time period")).toBeHidden();

  await nav.getByRole("button", { name: "Core vs. Tail", exact: true }).click();
  await expect(nav.getByRole("button", { name: "Core vs. Tail", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByText("Decision this page supports")).toBeVisible();
  await expect(page.getByLabel("Time period")).toBeVisible();
  await expect(page.getByText("Top products contributing the first 60% of Value")).toBeVisible();

  await page.getByRole("button", { name: /scope & definitions/i }).click();
  await expect(page.getByRole("dialog")).toContainText("Indicative GM = Sales - Cost * Quantity");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});

test("sticky filters remain visible after scroll", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Dashboard pages" });
  await nav.getByRole("button", { name: "PLV SKU Deep Dive", exact: true }).click();
  await page.mouse.wheel(0, 1200);
  await expect(page.getByLabel("Time period")).toBeVisible();
  await expect(page.getByRole("heading", { name: "PLV SKU Deep Dive" })).toBeVisible();
});
