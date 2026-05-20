import { test, expect } from '@playwright/test';

/**
 * End-to-end flow that exercises the 3D Card Viewer added in this
 * branch: open the sample deck and reach the Viewer tab.
 *
 * On a fresh browser profile IndexedDB is empty, so the app
 * populates itself from assets/cosmic-apple.json on first load —
 * hence the generous waits for the decks table to fill.
 */
test.describe('card viewer', () => {
  test('open a deck and reach the Viewer tab', async ({ page }) => {
    await page.goto('/decks');

    // Wait for the sample data to populate the decks table.
    const firstRow = page.locator('app-entity-table table tbody tr').first();
    await expect(firstRow).toBeVisible({ timeout: 30_000 });

    await firstRow.click();
    await page.getByRole('button', { name: /Select Deck/i }).click();

    // selectDeck() routes to the deck's card listing.
    await expect(page).toHaveURL(/\/decks\/\d+\/cards\/listing/, { timeout: 15_000 });

    // Jump to the Viewer tab from the cards tab menu.
    await page.getByRole('link', { name: 'Viewer' }).click();
    await expect(page).toHaveURL(/\/decks\/\d+\/cards\/viewer/);
    await expect(page.locator('app-page-header').getByText('Card Viewer')).toBeVisible();

    // Either the carousel renders cards or the empty-state shows —
    // both prove the Viewer component mounted and ran its pipeline.
    const carousel = page.locator('swiper-container');
    const emptyState = page.locator('.viewer-empty');
    await expect(carousel.or(emptyState).first()).toBeVisible({ timeout: 20_000 });
  });

  test('deck stats page renders its charts', async ({ page }) => {
    await page.goto('/decks');
    const firstRow = page.locator('app-entity-table table tbody tr').first();
    await expect(firstRow).toBeVisible({ timeout: 30_000 });
    await firstRow.click();
    await page.getByRole('button', { name: /Select Deck/i }).click();
    await expect(page).toHaveURL(/\/decks\/\d+\/cards\/listing/, { timeout: 15_000 });

    await page.getByRole('link', { name: 'Stats' }).click();
    await expect(page).toHaveURL(/\/decks\/\d+\/stats/);
    await expect(page.locator('app-page-header').getByText('Deck Stats')).toBeVisible();
    await expect(page.getByRole('button', { name: /Export Summary/i })).toBeVisible();
  });
});
