const { defineConfig, devices } = require('@playwright/test');

/**
 * BrowserStack configuration for testing public URLs
 */
module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/browserstack-public-results.json' }]
  ],

  use: {
    trace: 'on',
    screenshot: 'on',
    video: 'on',
  },

  projects: [
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
            buildName: 'Gutcheck MVP Public Test',
            sessionName: 'Chrome Desktop Public Test',
            userName: process.env.BROWSERSTACK_USERNAME,
            accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
          }))}`
        }
      },
    },
  ],
}); 