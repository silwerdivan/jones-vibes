import { test, expect } from '@playwright/test';

test.describe('Cognitive Re-Ed / Random Event Overlap Glitch', () => {
  test.beforeEach(async ({ page }) => {
    // Seed localStorage to bypass EULA and set initial state
    await page.addInitScript(() => {
      // Mock Math.random to ensure local event triggers
      // Local event chance is 0.3. 0.05 < 0.3.
      let mockRandomValues = [0.05, 0.0]; // First for chance check, second for event selection
      let index = 0;
      const originalRandom = Math.random;
      Math.random = () => {
        if (index < mockRandomValues.length) {
          return mockRandomValues[index++];
        }
        return originalRandom();
      };

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

  test('should NOT overwrite the Random Event modal with the Location Dashboard', async ({ page }) => {
    // 1. Find the Cognitive Re-Ed bento card
    const collegeCard = page.locator('[data-testid="city-travel-card-cognitive-re-ed"]');
    await expect(collegeCard).toBeVisible();

    // 2. Click to travel to Cognitive Re-Ed
    await collegeCard.click();

    // 3. Wait for the modal to be visible and assert it's the Random Event
    const modalOverlay = page.locator('#choice-modal-overlay');
    const modalTitle = page.locator('#choice-modal-title');
    
    // We expect "Stolen Datashard" to appear
    await expect(modalTitle).toHaveText('Stolen Datashard', { timeout: 5000 });
    
    // Check for one of the event choices
    const buyButton = page.locator('button', { hasText: 'Buy:' });
    await expect(buyButton).toBeVisible();

    // 4. Wait 1000ms (more than the 300ms handleAutoArrival timeout in UIManager)
    await page.waitForTimeout(1000);

    // 5. Assert it's STILL "Stolen Datashard" and NOT "Cognitive Re-Ed"
    // And buttons are still there
    await expect(modalTitle).toHaveText('Stolen Datashard');
    await expect(buyButton).toBeVisible();
  });
});
