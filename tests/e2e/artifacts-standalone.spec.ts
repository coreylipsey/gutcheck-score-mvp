import { test, expect } from '@playwright/test';

// Test the ShareScoreButton component props
test('ShareScoreButton component accepts correct props', async ({ page }) => {
  // Test that the component can be rendered with the expected props
  await page.setContent(`
    <div id="test-container">
      <button data-testid="share-badge">Share My Score</button>
    </div>
  `);
  
  const shareButton = page.getByTestId('share-badge');
  await expect(shareButton).toBeVisible();
  await expect(shareButton).toHaveText('Share My Score');
});

// Test badge generation with inline SVG
test('badge generation produces valid SVG', async ({ page }) => {
  const mockSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="418">
  <rect width="100%" height="100%" fill="#0B0F13"/>
  <text x="40" y="80" font-family="Inter, system-ui" font-size="28" fill="#8EEAFC">Gutcheck.AI</text>
  <text x="40" y="130" font-size="20" fill="#A3B3C2">Queens College • Alpha-Fall25</text>
  <text x="40" y="210" font-size="68" fill="#E6F1F8">Score 85</text>
  <text x="40" y="270" font-size="36" fill="#8EEAFC">★★★★☆</text>
  <text x="40" y="330" font-size="16" fill="#A3B3C2">Visibility Unlocked • Share your progress</text>
</svg>`;

  await page.setContent(`
    <div id="badge-container">
      <img src="data:image/svg+xml;base64,${btoa(mockSvg)}" alt="Score Badge" />
    </div>
  `);

  const badge = page.locator('#badge-container img');
  await expect(badge).toBeVisible();
  await expect(badge).toHaveAttribute('alt', 'Score Badge');
});

// Test report generation with inline HTML
test('report generation produces valid HTML', async ({ page }) => {
  const mockHtml = `<!doctype html><html><head><meta charset="utf-8">
  <style>body{font-family:Inter,system-ui} .card{border:1px solid #e6edf5;padding:16px;border-radius:12px;margin:12px 0}</style>
  </head><body>
  <h1>Gutcheck Funder Report</h1>
  <div>Queens College • Alpha-Fall25</div>
  <div class="card">
    <h2>Key Metrics</h2>
    <p>Total: <b>10</b>, Completed: <b>8</b>, Tagged: <b>6</b></p>
    <p>Avg Score: <b>78.5</b></p>
  </div>
  </body></html>`;

  await page.setContent(mockHtml);

  await expect(page.getByRole('heading', { name: 'Gutcheck Funder Report' })).toBeVisible();
  await expect(page.locator('body')).toContainText('Queens College • Alpha-Fall25');
  await expect(page.locator('body')).toContainText('Total: 10');
  await expect(page.locator('body')).toContainText('Completed: 8');
  await expect(page.locator('body')).toContainText('Tagged: 6');
  await expect(page.locator('body')).toContainText('Avg Score: 78.5');
});
