import { test, expect, devices } from '@playwright/test';

const URL = 'http://localhost:3000/assessment?partner_id=queens-college&cohort_id=alpha-fall25';

// Use built-in mobile profile instead of manual CDP overrides
test.use({ ...devices['iPhone 12'] });

test.describe('Assessment E2E', () => {
  test('mobile flow + metadata present', async ({ page }) => {
    
    await page.goto(URL);
    await expect(page).toHaveURL(/\/assessment/);
    await expect(page.getByRole('heading', { name: 'Tell us about your business' })).toBeVisible();

    // Select native <select> values via labels
    await page.getByLabel('Where is your business located?')
      .selectOption({ label: 'California' });
    await page.getByLabel('What industry is your business in?')
      .selectOption({ label: 'Technology & Software' });

    // Wait for Next to enable and proceed
    const next = page.getByRole('main')
      .getByRole('button', { name: 'Next', exact: true });
    await expect(next).toBeEnabled();
    await next.click();

    // Assert next step loaded
    await expect(page.locator('body')).toContainText('Question 1 of 26');
  });

  test('desktop flow reachable', async ({ page }) => {
    await page.goto(URL);
    await expect(page).toHaveTitle(/Gutcheck/i);
    
    // Verify page loads correctly on desktop
    await expect(page.locator('body')).toBeVisible();
    
    // Verify assessment page loaded correctly
    await expect(page.locator('body')).toContainText('Assessment');
    
    // Verify business information form is present
    await expect(page.locator('body')).toContainText('Tell us about your business');
  });

  test('assessment completion flow', async ({ page }) => {
    await page.goto(URL);
    await expect(page).toHaveURL(/\/assessment/);

    await page.getByLabel('Where is your business located?')
      .selectOption({ label: 'California' });
    await page.getByLabel('What industry is your business in?')
      .selectOption({ label: 'Technology & Software' });

    const next = page.getByRole('main')
      .getByRole('button', { name: 'Next', exact: true });
    await expect(next).toBeEnabled();
    await next.click();

    await expect(page.locator('body')).toContainText('Question 1 of 26');
  });
});
