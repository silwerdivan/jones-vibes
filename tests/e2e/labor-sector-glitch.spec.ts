import { test, expect } from '@playwright/test';

test.describe('Labor Sector mobile rebuild', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      Math.random = () => 0.99;

      const state = {
        players: [
          {
            id: 1,
            credits: 5000,
            savings: 0,
            sanity: 80,
            educationLevel: 0,
            educationCredits: 0,
            educationCreditsGoal: 0,
            careerLevel: 1,
            time: 24,
            location: 'Hab-Pod 404',
            hasCar: false,
            loan: 0,
            inventory: [],
            hunger: 0,
            timeDeficit: 0,
            weeklyIncome: 0,
            weeklyExpenses: 0,
            weeklySanityChange: 0,
            isAI: false,
            name: 'Test Player',
            wageMultiplier: 1.0,
            activeConditions: []
          },
          {
            id: 2,
            credits: 5000,
            savings: 0,
            sanity: 80,
            educationLevel: 0,
            educationCredits: 0,
            educationCreditsGoal: 0,
            careerLevel: 0,
            time: 24,
            location: 'Hab-Pod 404',
            hasCar: false,
            loan: 0,
            inventory: [],
            hunger: 0,
            timeDeficit: 0,
            weeklyIncome: 0,
            weeklyExpenses: 0,
            weeklySanityChange: 0,
            isAI: true,
            name: 'AI Opponent',
            wageMultiplier: 1.0,
            activeConditions: []
          }
        ],
        currentPlayerIndex: 0,
        turn: 1,
        gameOver: false,
        winnerId: null,
        log: [],
        isPlayer2AI: true,
        pendingTurnSummary: null,
        activeScreenId: 'city',
        activeLocationDashboard: null,
        activeChoiceContext: null,
        activeGraduation: null,
        isAIThinking: false,
        eventHistory: []
      };
      window.localStorage.setItem('jones_fastlane_save', JSON.stringify(state));
    });

    await page.goto('/');
  });

  test('uses segmented jobs and hustles panels with a top-right close button', async ({ page }) => {
    const laborSectorCard = page.locator('.bento-card', { hasText: 'Labor Sector' });
    await laborSectorCard.click();

    const modalOverlay = page.locator('#choice-modal-overlay');
    await expect(modalOverlay).not.toHaveClass(/hidden/, { timeout: 5000 });

    const jobsTab = page.locator('.labor-sector-tab[data-tab="jobs"]');
    const hustlesTab = page.locator('.labor-sector-tab[data-tab="hustles"]');
    await expect(jobsTab).toHaveClass(/active/);
    await expect(page.locator('.labor-sector-panel[data-panel="jobs"]')).toBeVisible();
    await expect(page.locator('.labor-sector-panel[data-panel="hustles"]')).toBeHidden();

    await hustlesTab.click();
    await expect(hustlesTab).toHaveClass(/active/);
    await expect(page.locator('.labor-sector-panel[data-panel="hustles"]')).toBeVisible();

    const workShiftButton = page.locator('.labor-shift-button', { hasText: 'Work Shift' });
    await jobsTab.click();
    await expect(workShiftButton).toBeVisible();

    const closeButton = page.locator('#choice-modal-close');
    await expect(closeButton).toBeVisible();
    const box = await closeButton.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.x).toBeGreaterThan(250);
    }

    await closeButton.click();
    await expect(modalOverlay).toHaveClass(/hidden/);
  });

  test('does not reopen after working a shift and closing the modal', async ({ page }) => {
    await page.locator('.bento-card', { hasText: 'Labor Sector' }).click();

    const modalOverlay = page.locator('#choice-modal-overlay');
    await expect(modalOverlay).not.toHaveClass(/hidden/, { timeout: 5000 });

    await page.locator('.labor-shift-button', { hasText: 'Work Shift' }).click();
    await page.locator('#choice-modal-close').click();
    await expect(modalOverlay).toHaveClass(/hidden/);

    await page.waitForTimeout(1500);
    await expect(modalOverlay).toHaveClass(/hidden/);
  });
});
