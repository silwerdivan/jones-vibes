import { test, expect } from '@playwright/test';

test.describe('Location Navigation and UI', () => {
  test.beforeEach(async ({ page }) => {
    // Seed localStorage to bypass EULA
    await page.addInitScript(() => {
      // Mock Math.random to prevent random events during tests
      // Local events have 30% chance, Consequence have 50%
      // Setting to 0.99 ensures they don't trigger
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

  test('should navigate to Ripperdoc Clinic and show its implant cards', async ({ page }) => {
    // 1. Find the Ripperdoc Clinic bento card
    const ripperdocCard = page.locator('[data-testid="city-travel-card-ripperdoc-clinic"]');
    await expect(ripperdocCard).toBeVisible();

    // 2. Click to travel to Ripperdoc Clinic
    // The first click triggers travel because we start at Hab-Pod 404
    await ripperdocCard.click();

    // 3. Click again to open the dashboard (if not auto-opened)
    // In our UIManager, auto-arrival should trigger showLocationDashboard after 300ms
    // We wait for the modal to be visible
    const modalOverlay = page.locator('#choice-modal-overlay');
    await expect(modalOverlay).not.toHaveClass(/hidden/, { timeout: 5000 });

    // 4. Verify the dashboard title
    const modalTitle = page.locator('#choice-modal-title');
    await expect(modalTitle).toHaveText('Ripperdoc Clinic');

    // 5. Verify the implant cards are visible
    const actionCards = page.locator('#choice-modal-content .action-card');
    await expect(actionCards).toHaveCount(4);

    // 6. Verify specific item names
    await expect(page.locator('#choice-modal-content .action-card-title')).toContainText([
      'Neural Co-Processor',
      'Synthetic Liver',
      'Adrenaline Pump',
    ]);
  });

  test('should navigate to Consumpt-Zone and show items', async ({ page }) => {
    const card = page.locator('[data-testid="city-travel-card-consumpt-zone"]');
    await expect(card).toBeVisible();
    await card.click();
    
    const modalOverlay = page.locator('#choice-modal-overlay');
    await expect(modalOverlay).not.toHaveClass(/hidden/, { timeout: 5000 });
    
    const modalTitle = page.locator('#choice-modal-title');
    await expect(modalTitle).toHaveText('Consumpt-Zone');
    
    const actionCards = page.locator('#choice-modal-content .action-card');
    const count = await actionCards.count();
    expect(count).toBeGreaterThan(0);
  });
});
