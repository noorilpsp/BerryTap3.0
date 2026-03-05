import { execSync } from "node:child_process";
import { expect, test, type Page } from "playwright/test";

async function assertNoErrorUI(page: Page) {
  await expect(page.getByText("Failed to load table view.")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Got it" })).toHaveCount(0);
}

async function clickTestIdIfVisible(page: Page, testId: string) {
  const btn = page.getByTestId(testId).first();
  if (await btn.isVisible().catch(() => false)) {
    await btn.click();
    return true;
  }
  return false;
}

test.describe("POS Golden Flow", () => {
  test.beforeAll(() => {
    // Documented expectation from app scripts.
    execSync("npm run seed:pos", { stdio: "inherit" });
  });

  test("floor map -> seat -> add -> send -> fire -> served -> close", async ({ page }) => {
    // 1) floor map
    await page.goto("/floor-map");
    await expect(page).toHaveURL(/\/floor-map/);

    // 2) open an available table from floor map
    const availableTable = page.locator('[data-testid^="floor-table-"][data-table-status="free"]').first();
    const fallbackTable = page.locator('[data-testid^="floor-table-"]').first();
    if (await availableTable.isVisible().catch(() => false)) {
      await availableTable.click();
    } else {
      await expect(fallbackTable).toBeVisible();
      await fallbackTable.click();
    }
    await expect(page).toHaveURL(/\/table\//);
    await assertNoErrorUI(page);

    // 3) seat party
    await expect(page.getByTestId("table-seat-party-open")).toBeVisible();
    await page.getByTestId("table-seat-party-open").click();
    await page.getByTestId("seat-party-size-2").click();
    await page.getByTestId("seat-party-seat-now").click();
    await page.getByTestId("seat-party-view-table").click();
    await assertNoErrorUI(page);

    // 4) add an item
    await page.getByTestId("table-action-add-items").click();
    const menuItemCard = page.locator('[data-testid^="menu-item-card-"]').first();
    await expect(menuItemCard).toBeVisible();
    await menuItemCard.click();

    // 5) send
    await page.getByTestId("table-action-send").click();
    await assertNoErrorUI(page);

    // 6) fire wave 1 (may already auto-fire; click only if visible)
    await clickTestIdIfVisible(page, "table-action-fire-wave");
    await assertNoErrorUI(page);

    // 7) mark served (progression depending on current wave/item status)
    await clickTestIdIfVisible(page, "table-orders-tab-by-wave");
    await clickTestIdIfVisible(page, "table-wave-action-cooking-w1");
    await clickTestIdIfVisible(page, "table-wave-action-ready-w1");
    const servedClicked =
      (await clickTestIdIfVisible(page, "table-wave-action-served-w1"));
    expect(servedClicked).toBeTruthy();
    await assertNoErrorUI(page);

    // 8) close session
    await page.getByTestId("table-more-options").click();
    await page.getByTestId("table-close-session").click();
    await expect(page).toHaveURL(/\/floor-map/);
    await assertNoErrorUI(page);
  });
});
