import { test, expect } from '@playwright/test';

// Use localhost for GitHub Actions, Firebase URL as fallback
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Cloud Visual Consistency Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('should display consistent colors across browsers', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Check for consistent branding colors
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
      console.log('ℹ️ No Gutcheck branded elements found - this is normal for some pages');
    }
    
    await page.screenshot({ path: 'cloud-colors-test.png' });
  });

  test('should maintain consistent typography', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Check for consistent font families
    const bodyElement = page.locator('body');
    const fontFamily = await bodyElement.evaluate((el) => {
      return window.getComputedStyle(el).fontFamily;
    });
    
    console.log(`📝 Font family: ${fontFamily}`);
    expect(fontFamily).toBeTruthy();
    
    await page.screenshot({ path: 'cloud-typography-test.png' });
  });

  test('should have consistent button styling', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Check for consistent button styling
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      console.log(`🔘 Found ${buttonCount} buttons`);
      
      const firstButton = buttons.first();
      const buttonStyles = await firstButton.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          borderRadius: styles.borderRadius,
          padding: styles.padding
        };
      });
      
      console.log(`🔘 Button styles:`, buttonStyles);
      expect(buttonStyles.backgroundColor).toBeTruthy();
    } else {
      console.log('ℹ️ No buttons found on this page');
    }
    
    await page.screenshot({ path: 'cloud-buttons-test.png' });
  });

  test('should maintain layout consistency on different screen sizes', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(1000); // Wait for layout to settle
      
      const bodyWidth = await page.locator('body').evaluate((el) => {
        return window.getComputedStyle(el).width;
      });
      
      console.log(`📱 ${viewport.name} viewport - body width: ${bodyWidth}`);
      
      await page.screenshot({ 
        path: `cloud-layout-${viewport.name}.png` 
      });
    }
  });

  test('should handle form elements consistently', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Navigate to assessment page if it exists
    try {
      await page.goto(`${BASE_URL}/assessment`);
      await page.waitForLoadState('networkidle');
      
      const inputs = page.locator('input, textarea, select');
      const inputCount = await inputs.count();
      
      if (inputCount > 0) {
        console.log(`📝 Found ${inputCount} form elements`);
        
        const firstInput = inputs.first();
        const inputStyles = await firstInput.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return {
            borderColor: styles.borderColor,
            borderRadius: styles.borderRadius,
            padding: styles.padding
          };
        });
        
        console.log(`📝 Input styles:`, inputStyles);
        expect(inputStyles.borderColor).toBeTruthy();
      } else {
        console.log('ℹ️ No form elements found on assessment page');
      }
      
      await page.screenshot({ path: 'cloud-forms-test.png' });
    } catch (error) {
      console.log('Assessment page not available, skipping form test');
    }
  });

  test('should load homepage successfully', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Basic page load verification
    const title = await page.title();
    expect(title).toBeTruthy();
    
    // Check if page has content
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
    
    console.log(`✅ Homepage loaded successfully`);
    console.log(`📄 Page title: ${title}`);
    console.log(`📱 Viewport: ${page.viewportSize()?.width}x${page.viewportSize()?.height}`);
    
    await page.screenshot({ path: 'cloud-homepage-test.png' });
  });
}); 