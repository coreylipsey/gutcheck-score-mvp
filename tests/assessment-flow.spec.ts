import { test, expect } from '@playwright/test';

test.describe('Assessment Flow Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the assessment page
    await page.goto('/assessment');
  });

  test('should display assessment questions consistently', async ({ page }) => {
    // Wait for assessment content to load
    await page.waitForSelector('[data-testid="assessment-question"], .question, h1, h2', { timeout: 10000 });
    
    // Check that questions are visible and properly styled
    const questions = page.locator('[data-testid="assessment-question"], .question, h1, h2').filter({ hasText: /./ });
    
    expect(await questions.count()).toBeGreaterThan(0);
    
    for (let i = 0; i < Math.min(await questions.count(), 3); i++) {
      const question = questions.nth(i);
      
      // Check visibility
      await expect(question).toBeVisible();
      
      // Check styling
      const styles = await question.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          fontSize: computed.fontSize,
          fontWeight: computed.fontWeight,
          color: computed.color,
          lineHeight: computed.lineHeight,
        };
      });
      
      // Should have readable text styling
      expect(parseFloat(styles.fontSize)).toBeGreaterThan(12);
      expect(styles.color).not.toBe('rgba(0, 0, 0, 0)');
    }
  });

  test('should handle form inputs consistently across browsers', async ({ page }) => {
    // Look for form inputs (radio buttons, checkboxes, text inputs)
    const inputs = page.locator('input, textarea, select');
    
    for (let i = 0; i < Math.min(await inputs.count(), 5); i++) {
      const input = inputs.nth(i);
      
      // Check input is visible and interactive
      await expect(input).toBeVisible();
      
      const inputType = await input.getAttribute('type');
      
      if (inputType === 'radio' || inputType === 'checkbox') {
        // Test radio/checkbox functionality
        await input.click();
        
        // Verify selection state
        const isChecked = await input.isChecked();
        expect(isChecked).toBe(true);
      } else if (inputType === 'text' || inputType === 'textarea') {
        // Test text input functionality
        await input.fill('Test input');
        const value = await input.inputValue();
        expect(value).toBe('Test input');
      }
    }
  });

  test('should maintain consistent button styling and behavior', async ({ page }) => {
    const buttons = page.locator('button, [role="button"], input[type="submit"]');
    
    for (let i = 0; i < Math.min(await buttons.count(), 3); i++) {
      const button = buttons.nth(i);
      
      // Check button styling
      const styles = await button.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          color: computed.color,
          borderRadius: computed.borderRadius,
          padding: computed.padding,
          cursor: computed.cursor,
        };
      });
      
      // Should have proper button styling
      expect(styles.cursor).toBe('pointer');
      expect(styles.padding).not.toBe('0px');
      
      // Check button text is readable
      const buttonText = await button.textContent();
      if (buttonText && buttonText.trim()) {
        expect(buttonText.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test('should handle responsive design for assessment flow', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1024, height: 768, name: 'Desktop' },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500);
      
      // Check that assessment content is properly contained
      const container = page.locator('main, .container, .assessment-container, [role="main"]').first();
      if (await container.count() > 0) {
        const isVisible = await container.isVisible();
        expect(isVisible).toBe(true);
        
        // Check no horizontal overflow
        const overflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth <= window.innerWidth;
        });
        expect(overflow).toBe(true);
      }
      
      // Check that form elements are still accessible
      const inputs = page.locator('input, textarea, select');
      if (await inputs.count() > 0) {
        const firstInput = inputs.first();
        await expect(firstInput).toBeVisible();
      }
    }
  });

  test('should handle form validation consistently', async ({ page }) => {
    // Look for submit buttons
    const submitButtons = page.locator('button[type="submit"], input[type="submit"], button:has-text("Submit"), button:has-text("Next")');
    
    if (await submitButtons.count() > 0) {
      const submitButton = submitButtons.first();
      
      // Try to submit without filling required fields
      await submitButton.click();
      
      // Wait for potential validation messages
      await page.waitForTimeout(1000);
      
      // Check for validation messages
      const errorMessages = page.locator('.error, .validation-error, [role="alert"], .text-red-500, .text-red-600');
      
      // If there are validation errors, they should be visible and styled consistently
      if (await errorMessages.count() > 0) {
        for (let i = 0; i < Math.min(await errorMessages.count(), 3); i++) {
          const error = errorMessages.nth(i);
          await expect(error).toBeVisible();
          
          // Check error styling
          const color = await error.evaluate((el) => {
            return window.getComputedStyle(el).color;
          });
          
          // Should have error color styling
          expect(color).toMatch(/rgb\(239, 68, 68\)|rgb\(220, 38, 38\)|red/);
        }
      }
    }
  });

  test('should maintain consistent loading states', async ({ page }) => {
    // Look for loading indicators
    const loadingIndicators = page.locator('.loading, .spinner, [aria-busy="true"], .animate-spin');
    
    if (await loadingIndicators.count() > 0) {
      for (let i = 0; i < Math.min(await loadingIndicators.count(), 3); i++) {
        const loader = loadingIndicators.nth(i);
        
        // Check loading indicator is visible
        await expect(loader).toBeVisible();
        
        // Check it has proper styling
        const styles = await loader.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            display: computed.display,
            visibility: computed.visibility,
          };
        });
        
        expect(styles.display).not.toBe('none');
        expect(styles.visibility).not.toBe('hidden');
      }
    }
  });

  test('should handle navigation consistently', async ({ page }) => {
    // Test navigation buttons/links
    const navButtons = page.locator('a, button, [role="link"]').filter({ hasText: /back|next|previous|continue/i });
    
    for (let i = 0; i < Math.min(await navButtons.count(), 3); i++) {
      const navButton = navButtons.nth(i);
      
      // Check navigation element is visible and clickable
      await expect(navButton).toBeVisible();
      
      const styles = await navButton.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          cursor: computed.cursor,
          pointerEvents: computed.pointerEvents,
        };
      });
      
      // Should be clickable
      expect(['pointer', 'default']).toContain(styles.cursor);
      expect(styles.pointerEvents).not.toBe('none');
    }
  });
}); 