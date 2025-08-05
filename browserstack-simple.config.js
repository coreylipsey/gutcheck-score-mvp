const { defineConfig, devices } = require('@playwright/test');

/**
 * Simplified BrowserStack configuration for initial testing
 */
module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: false, // Start with single worker for debugging
  forbidOnly: !!process.env.CI,
  retries: 0, // No retries for initial testing
  workers: 1, // Single worker
  
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/browserstack-simple-results.json' }]
  ],

  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on',
    screenshot: 'on',
    video: 'on',
  },

  projects: [
    // Start with just Chrome Desktop for testing
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
            buildName: 'Gutcheck MVP Test',
            sessionName: 'Chrome Desktop Simple Test',
            userName: process.env.BROWSERSTACK_USERNAME,
            accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
            local: 'true', // Enable local testing
            localIdentifier: 'gutcheck-mvp-test',
          }))}`
        }
      },
    },
  ],

  // Don't start webServer - we'll use the existing one
  // webServer: null,
}); 