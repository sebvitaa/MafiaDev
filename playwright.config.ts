import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  workers: 1,
  retries: process.env.CI ? 1 : 0, // runner de CI más lento: tests con ventanas de 130-500 ms fallan de forma intermitente
  reporter: [['list']],
  use: { baseURL: 'http://localhost:5184', trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run dev -- --port 5184 --strictPort',
    url: 'http://localhost:5184',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
