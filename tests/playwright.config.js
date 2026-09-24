const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'cd ../backend && npm start',
      port: 3001,
      reuseExistingServer: true,
      timeout: 10000,
    },
    {
      command: 'cd ../frontend && npm run dev',
      port: 5173,
      reuseExistingServer: true,
      timeout: 10000,
    },
  ],
  reporter: [['html', { open: 'never' }], ['list']],
});
