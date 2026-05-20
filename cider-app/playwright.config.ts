import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration for the Cider Angular app.
 *
 * The suite drives a real browser, so it CANNOT run inside the
 * sandboxed Claude Code container (the multi-process browser is
 * killed there). It is designed to run in GitHub Actions — see
 * .github/workflows/e2e.yml — or locally via `npm run e2e`.
 *
 * `webServer` boots the Angular dev server before the tests and
 * tears it down afterwards. First compile is slow, hence the
 * generous timeout.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: process.env['CI'] ? [['html', { open: 'never' }], ['list']] : 'list',
  timeout: 60_000,
  expect: { timeout: 15_000 },

  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ],

  webServer: {
    command: 'npm start',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env['CI'],
    timeout: 240_000
  }
});
