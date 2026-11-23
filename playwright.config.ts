import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0, // runner de CI más lento: tests con ventanas de 130-500 ms fallan de forma intermitente
  reporter: [['list']],
  use: { baseURL: 'http://localhost:8080', trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run dev -- --strictPort',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
