import { test, expect } from '@playwright/test';

test.describe('BrowserStack Traditional Tests', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Basic page load verification
    const title = await page.title();
    expect(title).toBeTruthy();
    
    // Check if page has content
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
    
    // Take a screenshot for visual verification
    await page.screenshot({ path: 'browserstack-homepage.png' });
    
    console.log(`✅ Homepage loaded successfully`);
    console.log(`📄 Page title: ${title}`);
    console.log(`📱 Viewport: ${page.viewportSize()?.width}x${page.viewportSize()?.height}`);
  });

  test('should navigate to assessment page', async ({ page }) => {
    await page.goto('/assessment');
    await page.waitForLoadState('networkidle');
    
    // Check if assessment page loads
    const title = await page.title();
    expect(title).toBeTruthy();
    
    // Look for assessment-specific content
    const assessmentContent = await page.textContent('body');
    expect(assessmentContent).toBeTruthy();
    
    await page.screenshot({ path: 'browserstack-assessment.png' });
    
    console.log(`✅ Assessment page loaded successfully`);
    console.log(`📄 Page title: ${title}`);
  });

  test('should display consistent branding', async ({ page }) => {
    await page.goto('/');
    
    // Check for Gutcheck branding elements
    const gutcheckElements = page.locator('[class*="gutcheck"], [class*="bg-gutcheck"]');
    const elementCount = await gutcheckElements.count();
    
    if (elementCount > 0) {
      console.log(`🎨 Found ${elementCount} Gutcheck branded elements`);
      
      // Check the first branded element
      const firstElement = gutcheckElements.first();
      const backgroundColor = await firstElement.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });
      
      console.log(`🎨 First branded element background: ${backgroundColor}`);
      expect(backgroundColor).toBeTruthy();
    } else {
      console.log('ℹ️ No Gutcheck branded elements found on this page');
    }
    
    await page.screenshot({ path: 'browserstack-branding.png' });
  });
}); 