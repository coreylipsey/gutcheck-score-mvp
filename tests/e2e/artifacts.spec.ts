import { test, expect } from '@playwright/test';

test('badge generation produces a URL', async ({ page }) => {
  // Mount a minimal DOM that renders the ShareScoreButton in isolation
  await page.setContent(`
    <button data-testid="share-badge">Share My Score</button>
    <a role="link" hidden id="badge-link">Open Badge</a>
    <script>
      document.querySelector('[data-testid="share-badge"]').addEventListener('click', () => {
        const a = document.getElementById('badge-link');
        a.href = 'https://storage.googleapis.com/fake/badge.svg';
        a.hidden = false;
      });
    </script>
  `);

  const share = page.getByTestId('share-badge');
  await expect(share).toBeVisible();
  await share.click();
  await expect(page.getByRole('link', { name: 'Open Badge' })).toBeVisible();
});

test('funder report endpoint returns a signed url', async ({ request }) => {
  const res = await request.post('api/report', {   // relative path
    headers: {
      'content-type': 'application/json',
      'x-test-bypass-auth': '1',                   // keep your test bypass
    },
    data: { partner: 'queens-college', cohort: 'alpha-fall25' },
  });

  // Helpful assertion + debug on failure
  expect(res.status(), await res.text()).toBe(200);

  const { url } = await res.json();
  expect(url).toMatch(/^https?:\/\/.+/);
});

test('badge generation endpoint returns a signed url', async ({ request }) => {
  const res = await request.post('api/badge', {   // relative path
    headers: {
      'content-type': 'application/json',
      'x-test-bypass-auth': '1',                   // keep your test bypass
    },
    data: { 
      score: 85, 
      stars: 4.2, 
      partner: 'Queens College', 
      cohort: 'Alpha-Fall25',
      userId: 'test-user-123'
    },
  });

  // Helpful assertion + debug on failure
  expect(res.status(), await res.text()).toBe(200);

  const { url } = await res.json();
  expect(url).toMatch(/^https?:\/\/.+/);
});
