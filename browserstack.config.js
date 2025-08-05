const { defineConfig, devices } = require('@playwright/test');

/**
 * BrowserStack configuration for cross-browser and cross-device testing
 * 
 * To use this:
 * 1. Sign up for BrowserStack: https://www.browserstack.com/
 * 2. Get your username and access key from your BrowserStack dashboard
 * 3. Set environment variables: BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY
 * 4. Run: npx playwright test --config=browserstack.config.js
 */

module.exports = defineConfig({
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
    // Desktop Browsers
    {
      name: 'Chrome Desktop',
      use: {
        ...devices['Desktop Chrome'],
        connectOptions: {
          wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify({
            browserName: 'chrome',
            browserVersion: 'latest',
            os: 'Windows',
            osVersion: '11',
            buildName: 'Gutcheck MVP Visual Tests',
            sessionName: 'Chrome Desktop Test',
            userName: process.env.BROWSERSTACK_USERNAME,
            accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
          }))}`
        }
      },
    },
    {
      name: 'Firefox Desktop',
      use: {
        ...devices['Desktop Firefox'],
        connectOptions: {
          wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify({
            browserName: 'firefox',
            browserVersion: 'latest',
            os: 'Windows',
            osVersion: '11',
            buildName: 'Gutcheck MVP Visual Tests',
            sessionName: 'Firefox Desktop Test',
            userName: process.env.BROWSERSTACK_USERNAME,
            accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
          }))}`
        }
      },
    },
    {
      name: 'Safari Desktop',
      use: {
        ...devices['Desktop Safari'],
        connectOptions: {
          wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify({
            browserName: 'safari',
            browserVersion: 'latest',
            os: 'OS X',
            osVersion: 'Ventura',
            buildName: 'Gutcheck MVP Visual Tests',
            sessionName: 'Safari Desktop Test',
            userName: process.env.BROWSERSTACK_USERNAME,
            accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
          }))}`
        }
      },
    },
    {
      name: 'Edge Desktop',
      use: {
        ...devices['Desktop Edge'],
        connectOptions: {
          wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify({
            browserName: 'edge',
            browserVersion: 'latest',
            os: 'Windows',
            osVersion: '11',
            buildName: 'Gutcheck MVP Visual Tests',
            sessionName: 'Edge Desktop Test',
            userName: process.env.BROWSERSTACK_USERNAME,
            accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
          }))}`
        }
      },
    },

    // Mobile Devices
    {
      name: 'iPhone 14',
      use: {
        ...devices['iPhone 14'],
        connectOptions: {
          wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify({
            deviceName: 'iPhone 14',
            osVersion: '16',
            browserName: 'safari',
            buildName: 'Gutcheck MVP Visual Tests',
            sessionName: 'iPhone 14 Safari Test',
            userName: process.env.BROWSERSTACK_USERNAME,
            accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
          }))}`
        }
      },
    },
    {
      name: 'Samsung Galaxy S23',
      use: {
        ...devices['Galaxy S23'],
        connectOptions: {
          wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify({
            deviceName: 'Samsung Galaxy S23',
            osVersion: '13.0',
            browserName: 'chrome',
            buildName: 'Gutcheck MVP Visual Tests',
            sessionName: 'Samsung Galaxy S23 Chrome Test',
            userName: process.env.BROWSERSTACK_USERNAME,
            accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
          }))}`
        }
      },
    },
    {
      name: 'iPad Pro',
      use: {
        ...devices['iPad Pro'],
        connectOptions: {
          wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify({
            deviceName: 'iPad Pro 12.9 2021',
            osVersion: '16',
            browserName: 'safari',
            buildName: 'Gutcheck MVP Visual Tests',
            sessionName: 'iPad Pro Safari Test',
            userName: process.env.BROWSERSTACK_USERNAME,
            accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
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