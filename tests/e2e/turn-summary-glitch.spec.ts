import { test, expect } from '@playwright/test';

test.describe('Turn Summary Endless Loop Glitch', () => {
  test.beforeEach(async ({ page }) => {
    // Seed localStorage to bypass EULA and set initial state
    await page.addInitScript(() => {
      // Mock Math.random to ensure consistent AI behavior and prevent random events
      const originalRandom = Math.random;
      Math.random = () => 0.5; // Neutral random value

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
            location: 'Hab-Pod 404', // Player starts at Hab-Pod 404
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

  test('should not show the turn summary modal again after advancing turn', async ({ page }) => {
    // 1. Player clicks on Hab-Pod 404
    const homeCard = page.locator('.bento-card', { hasText: 'Hab-Pod 404' });
    await expect(homeCard).toBeVisible();
    await homeCard.click();

    // 2. Click "Rest / End Turn"
    const endTurnBtn = page.locator('button', { hasText: 'Rest / End Turn' });
    await expect(endTurnBtn).toBeVisible();
    await endTurnBtn.click();

    // 3. Wait for the "Oh What A Weekend" modal to appear
    const summaryModal = page.locator('#turn-summary-modal');
    await expect(summaryModal).not.toHaveClass(/hidden/);
    await expect(page.locator('#summary-subtitle')).toContainText('TEST PLAYER');
    await expect(page.locator('.impact-label').nth(1)).toHaveText('SANITY');
    await expect(page.locator('#summary-sanity-total')).toHaveText('-5');

    // 4. Click "START NEXT WEEK ->"
    const nextWeekBtn = page.locator('#btn-start-next-week');
    await expect(nextWeekBtn).toBeVisible();
    await nextWeekBtn.click();

    // 5. Modal should hide immediately
    await expect(summaryModal).toHaveClass(/hidden/);

    // 6. AI Turn runs (UI should show "AI is thinking..." overlay, then it hides)
    const loadingOverlay = page.locator('#loading-overlay');
    // We expect the AI turn to start and eventually end.
    // We wait up to 10 seconds for it to disappear, to allow the AI to finish.
    await expect(loadingOverlay).toHaveClass(/hidden/, { timeout: 10000 });

    // 7. Wait an additional 1 second to ensure the loop doesn't re-trigger
    await page.waitForTimeout(1000);

    // 8. Assert that the summary modal is STILL hidden. It shouldn't pop up for the AI's turn summary.
    await expect(summaryModal).toHaveClass(/hidden/);
    
    // Also assert that it's actually the player's turn again (Cycle 2)
    // Or at least that the AI didn't loop infinitely
    const currentTurnLog = page.locator('.intel-terminal .terminal-entries');
    // Not strictly necessary, the main issue is the modal popping up again.
  });
});
