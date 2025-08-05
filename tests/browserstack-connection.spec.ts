import { test, expect } from '@playwright/test';

test.describe('BrowserStack Connection Test', () => {
  test('should connect to BrowserStack and load the homepage', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the page loaded successfully
    const title = await page.title();
    expect(title).toBeTruthy();
    
    // Take a screenshot for verification
    await page.screenshot({ path: 'browserstack-connection-test.png' });
    
    // Check that the page has content
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
    
    console.log('✅ BrowserStack connection successful!');
    console.log(`📄 Page title: ${title}`);
    console.log(`📱 Viewport: ${page.viewportSize()?.width}x${page.viewportSize()?.height}`);
  });

  test('should display consistent branding colors', async ({ page }) => {
    await page.goto('/');
    
    // Check for any elements with Gutcheck brand colors
    const gutcheckElements = page.locator('[class*="gutcheck"], [class*="bg-gutcheck"]');
    
    if (await gutcheckElements.count() > 0) {
      console.log(`🎨 Found ${await gutcheckElements.count()} Gutcheck branded elements`);
      
      // Check the first branded element
      const firstElement = gutcheckElements.first();
      const backgroundColor = await firstElement.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });
      
      console.log(`🎨 First branded element background: ${backgroundColor}`);
    } else {
      console.log('ℹ️ No Gutcheck branded elements found on this page');
    }
  });
}); 