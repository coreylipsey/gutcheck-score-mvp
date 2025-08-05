import { test, expect } from '@playwright/test';

test.describe('BrowserStack Public URL Test', () => {
  test('should connect to BrowserStack and load a public website', async ({ page }) => {
    // Navigate to a public website instead of localhost
    await page.goto('https://example.com');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the page loaded successfully
    const title = await page.title();
    expect(title).toBeTruthy();
    
    // Take a screenshot for verification
    await page.screenshot({ path: 'browserstack-public-test.png' });
    
    // Check that the page has content
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
    
    console.log('✅ BrowserStack connection successful!');
    console.log(`📄 Page title: ${title}`);
    console.log(`📱 Viewport: ${page.viewportSize()?.width}x${page.viewportSize()?.height}`);
    console.log(`🌐 URL: ${page.url()}`);
  });

  test('should verify browser capabilities', async ({ page }) => {
    await page.goto('https://example.com');
    
    // Get browser information
    const userAgent = await page.evaluate(() => navigator.userAgent);
    const viewport = page.viewportSize();
    
    console.log(`🔍 User Agent: ${userAgent}`);
    console.log(`📐 Viewport: ${viewport?.width}x${viewport?.height}`);
    
    // Verify we're running in a real browser environment
    expect(userAgent).toContain('Chrome');
    expect(viewport).toBeTruthy();
  });
}); 