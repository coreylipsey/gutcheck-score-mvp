import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/browserstack-results.json' }],
    ['junit', { outputFile: 'test-results/browserstack-results.xml' }]
  ],
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'BrowserStack Chrome',
      use: {
        ...devices['Desktop Chrome'],
        connectOptions: {
          wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify({
            browserName: 'chrome',
            browserVersion: 'latest',
            os: 'Windows',
            osVersion: '11',
            buildName: 'Gutcheck MVP Traditional Test',
            sessionName: 'Chrome Desktop Test',
            userName: process.env.BROWSERSTACK_USERNAME || 'coreylipsey_CicmlG',
            accessKey: process.env.BROWSERSTACK_ACCESS_KEY || 'qRbyY1vhLqJDjNwJqN7E',
            local: 'true',
            localIdentifier: 'gutcheck-mvp-test',
          }))}`
        }
      },
    },
    {
      name: 'BrowserStack Safari',
      use: {
        ...devices['Desktop Safari'],
        connectOptions: {
          wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify({
            browserName: 'playwright-webkit',
            browserVersion: 'latest',
            os: 'OS X',
            osVersion: 'Ventura',
            buildName: 'Gutcheck MVP Traditional Test',
            sessionName: 'Safari Desktop Test',
            userName: process.env.BROWSERSTACK_USERNAME || 'coreylipsey_CicmlG',
            accessKey: process.env.BROWSERSTACK_ACCESS_KEY || 'qRbyY1vhLqJDjNwJqN7E',
            local: 'true',
            localIdentifier: 'gutcheck-mvp-test',
          }))}`
        }
      },
    },
    {
      name: 'BrowserStack Mobile',
      use: {
        ...devices['iPhone 12'],
        connectOptions: {
          wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify({
            deviceName: 'Samsung Galaxy S23 Ultra',
            browserName: 'chrome',
            osVersion: '13.0',
            buildName: 'Gutcheck MVP Traditional Test',
            sessionName: 'Mobile Chrome Test',
            userName: process.env.BROWSERSTACK_USERNAME || 'coreylipsey_CicmlG',
            accessKey: process.env.BROWSERSTACK_ACCESS_KEY || 'qRbyY1vhLqJDjNwJqN7E',
            local: 'true',
            localIdentifier: 'gutcheck-mvp-test',
          }))}`
        }
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
}); 