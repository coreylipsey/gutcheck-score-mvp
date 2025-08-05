import { test, expect } from '@playwright/test';

test.describe('Visual Consistency Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the main page
    await page.goto('/');
  });

  test('should display consistent colors across browsers', async ({ page }) => {
    // Test Gutcheck brand colors
    const colorTests = [
      { selector: '.bg-gutcheck-deep-navy', expectedColor: 'rgb(10, 31, 68)' },
      { selector: '.bg-gutcheck-electric-blue', expectedColor: 'rgb(20, 122, 255)' },
      { selector: '.bg-gutcheck-vibrant-teal', expectedColor: 'rgb(25, 194, 160)' },
      { selector: '.bg-gutcheck-bright-orange', expectedColor: 'rgb(255, 107, 0)' },
      { selector: '.bg-gutcheck-bright-yellow', expectedColor: 'rgb(255, 199, 0)' },
    ];

    for (const test of colorTests) {
      const element = page.locator(test.selector).first();
      if (await element.count() > 0) {
        const backgroundColor = await element.evaluate((el) => {
          return window.getComputedStyle(el).backgroundColor;
        });
        expect(backgroundColor).toBe(test.expectedColor);
      }
    }
  });

  test('should maintain consistent typography', async ({ page }) => {
    // Test font family consistency
    const textElements = page.locator('h1, h2, h3, p, button, input, textarea');
    
    for (let i = 0; i < Math.min(await textElements.count(), 10); i++) {
      const element = textElements.nth(i);
      const fontFamily = await element.evaluate((el) => {
        return window.getComputedStyle(el).fontFamily;
      });
      
      // Should use Inter font family or fallback to system fonts
      expect(fontFamily).toMatch(/Inter|system-ui|sans-serif/);
    }
  });

  test('should have consistent button styling', async ({ page }) => {
    const buttons = page.locator('button');
    
    for (let i = 0; i < Math.min(await buttons.count(), 5); i++) {
      const button = buttons.nth(i);
      
      // Check button has proper styling
      const styles = await button.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          borderRadius: computed.borderRadius,
          padding: computed.padding,
          cursor: computed.cursor,
        };
      });
      
      expect(styles.cursor).toBe('pointer');
      expect(styles.borderRadius).not.toBe('0px');
      expect(styles.padding).not.toBe('0px');
    }
  });

  test('should maintain layout consistency on different screen sizes', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop Large' },
      { width: 1366, height: 768, name: 'Desktop Small' },
      { width: 768, height: 1024, name: 'Tablet Portrait' },
      { width: 375, height: 667, name: 'Mobile Portrait' },
      { width: 414, height: 896, name: 'Mobile Large' },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Wait for layout to stabilize
      await page.waitForTimeout(500);
      
      // Check that main content is visible and properly positioned
      const mainContent = page.locator('main, .main, #main, [role="main"]').first();
      if (await mainContent.count() > 0) {
        const isVisible = await mainContent.isVisible();
        expect(isVisible).toBe(true);
        
        // Check that content doesn't overflow horizontally
        const overflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth <= window.innerWidth;
        });
        expect(overflow).toBe(true);
      }
    }
  });

  test('should handle form elements consistently', async ({ page }) => {
    // Test form input styling
    const inputs = page.locator('input, textarea, select');
    
    for (let i = 0; i < Math.min(await inputs.count(), 5); i++) {
      const input = inputs.nth(i);
      
      const styles = await input.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          border: computed.border,
          borderRadius: computed.borderRadius,
          padding: computed.padding,
        };
      });
      
      // Should have consistent border and padding
      expect(styles.border).not.toBe('none');
      expect(styles.padding).not.toBe('0px');
    }
  });

  test('should maintain consistent spacing and alignment', async ({ page }) => {
    // Test that elements have consistent spacing
    const containers = page.locator('div, section, article').filter({ hasText: /./ });
    
    for (let i = 0; i < Math.min(await containers.count(), 10); i++) {
      const container = containers.nth(i);
      
      const styles = await container.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          margin: computed.margin,
          padding: computed.padding,
          display: computed.display,
        };
      });
      
      // Should have consistent display properties
      expect(['block', 'flex', 'grid', 'inline-block']).toContain(styles.display);
    }
  });

  test('should handle dark mode consistently', async ({ page }) => {
    // Test dark mode colors
    await page.evaluate(() => {
      // Simulate dark mode
      document.documentElement.style.colorScheme = 'dark';
      document.documentElement.classList.add('dark');
    });
    
    await page.waitForTimeout(100);
    
    // Check that dark mode colors are applied
    const bodyColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    
    // Should have dark background in dark mode
    expect(bodyColor).toMatch(/rgb\(10, 10, 10\)|rgba\(10, 10, 10/);
  });

  test('should maintain accessibility standards', async ({ page }) => {
    // Test color contrast
    const textElements = page.locator('h1, h2, h3, p, span, div').filter({ hasText: /./ });
    
    for (let i = 0; i < Math.min(await textElements.count(), 5); i++) {
      const element = textElements.nth(i);
      
      const contrast = await element.evaluate((el) => {
        const style = window.getComputedStyle(el);
        const backgroundColor = style.backgroundColor;
        const color = style.color;
        
        // Simple contrast check - in a real test, you'd use a proper contrast calculation
        return { backgroundColor, color };
      });
      
      // Should have defined colors
      expect(contrast.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
      expect(contrast.color).not.toBe('rgba(0, 0, 0, 0)');
    }
  });

  test('should handle images and icons consistently', async ({ page }) => {
    const images = page.locator('img, svg');
    
    for (let i = 0; i < Math.min(await images.count(), 5); i++) {
      const image = images.nth(i);
      
      // Check that images are properly loaded and visible
      const isVisible = await image.isVisible();
      expect(isVisible).toBe(true);
      
      // Check that images have proper alt text or aria labels
      const altText = await image.getAttribute('alt');
      const ariaLabel = await image.getAttribute('aria-label');
      
      if (!altText && !ariaLabel) {
        // For decorative images, this might be acceptable
        const role = await image.getAttribute('role');
        expect(role === 'presentation' || role === 'img').toBe(true);
      }
    }
  });
}); 