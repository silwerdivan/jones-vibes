import { test, expect } from '@playwright/test';

test.describe('Labor Sector Double Popup Glitch', () => {
  test.beforeEach(async ({ page }) => {
    // Seed localStorage to bypass EULA and set initial state
    await page.addInitScript(() => {
      // Mock Math.random to prevent random events during tests
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

  test('should NOT show the Labor Sector modal again after clicking Work Shift and then closing it', async ({ page }) => {
    // 1. Find the Labor Sector bento card
    const laborSectorCard = page.locator('.bento-card', { hasText: 'Labor Sector' });
    await expect(laborSectorCard).toBeVisible();

    // 2. Click to travel to Labor Sector
    await laborSectorCard.click();

    // 3. Wait for the modal to be visible
    const modalOverlay = page.locator('#choice-modal-overlay');
    await expect(modalOverlay).not.toHaveClass(/hidden/, { timeout: 5000 });

    // 4. Click "Work Shift"
    // We need to find the Work Shift button. It's a secondary action button.
    const workShiftButton = page.locator('button', { hasText: 'Work Shift' });
    await workShiftButton.click();

    // 5. Click "Leave Location" immediately
    const leaveButton = page.locator('#modal-cancel-button');
    await leaveButton.click();

    // 6. Assert the modal is hidden
    await expect(modalOverlay).toHaveClass(/hidden/);

    // 7. Wait 1500ms (more than the 1000ms Work Shift refresh timeout)
    await page.waitForTimeout(1500);

    // 8. Assert it does NOT reappear
    // This is expected to FAIL if the glitch exists
    await expect(modalOverlay).toHaveClass(/hidden/);
  });
});
