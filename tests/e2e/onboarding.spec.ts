import { test, expect } from '@playwright/test';

test('new onboarding starts a default AI run', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.removeItem('jones_fastlane_save');
  });

  await page.goto('/');

  await expect(page.locator('.eula-container')).toBeVisible();
  await expect(page.locator('.eula-container')).not.toContainText('OPPONENT_LINK_CONFIGURATION');
  await expect(page.locator('.eula-container')).not.toContainText('OPTIONAL_PROTOCOL_ENHANCEMENTS');

  await page.locator('#eula-accept-btn').click();
  await page.waitForFunction(() => !!window.localStorage.getItem('jones_fastlane_save'));

  const savedState = await page.evaluate(() => JSON.parse(window.localStorage.getItem('jones_fastlane_save') || '{}'));
  expect(savedState.isPlayer2AI).toBe(true);
  expect(savedState.players?.[1]?.isAI).toBe(true);
});
