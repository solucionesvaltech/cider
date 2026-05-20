import { test, expect } from '@playwright/test';

/**
 * Route-level smoke tests: every top-level page mounts and renders
 * its header. No data dependency — these only prove routing, module
 * wiring and the component tree boot cleanly.
 */
test.describe('app smoke', () => {
  test('welcome page renders with a call to action', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('app-page-header').getByText('Welcome')).toBeVisible();
    await expect(page.getByRole('button', { name: /Get Started/i })).toBeVisible();
  });

  test('projects page renders with the projects table', async ({ page }) => {
    await page.goto('/projects');
    await expect(page.locator('app-page-header').getByText('Projects')).toBeVisible();
    await expect(page.locator('app-entity-table')).toBeVisible();
  });

  test('decks page renders with the decks table', async ({ page }) => {
    await page.goto('/decks');
    await expect(page.locator('app-page-header').getByText('Decks')).toBeVisible();
    await expect(page.locator('app-entity-table')).toBeVisible();
  });

  test('print templates page renders', async ({ page }) => {
    await page.goto('/print-templates');
    await expect(page.locator('app-page-header').getByText('Print Templates')).toBeVisible();
    await expect(page.locator('app-entity-table')).toBeVisible();
  });
});
