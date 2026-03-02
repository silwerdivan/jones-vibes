import { describe, it, expect, beforeEach, vi } from 'vitest';
import GameState from '../src/game/GameState';
import Player from '../src/game/Player';
import { COURSES } from '../src/data/courses';
import EventBus, { STATE_EVENTS } from '../src/EventBus';
import AIController from '../src/game/AIController';

describe('Education System Upgrade', () => {
    let gameState: GameState;
    let player: Player;

    beforeEach(() => {
        gameState = new GameState(2, true); // AI player is player 2
        gameState.currentPlayerIndex = 0; // Test with Player 1 first
        player = gameState.getCurrentPlayer();
        player.cash = 5000;
        player.time = 24;
        player.happiness = 100;
        player.location = 'Cognitive Re-Ed';
        // Reset EventBus
        (EventBus as any).events = {};
    });

    it('should require enrollment before studying', () => {
        const result = gameState.study();
        expect(result).toBe(false);
        expect(gameState.log[0].text).toContain('must enroll');
    });

    it('should allow enrollment in the first course', () => {
        const result = gameState.takeCourse(1); // Found. Compl.
        expect(result).toBe(true);
        expect(player.educationCreditsGoal).toBe(50);
        expect(player.cash).toBe(4500); // 5000 - 500
        expect(player.time).toBe(23); // 24 - 1
    });

    it('should allow studying after enrollment', () => {
        gameState.takeCourse(1);
        const result = gameState.study();
        expect(result).toBe(true);
        expect(player.educationCredits).toBe(8);
        expect(player.time).toBe(15); // 23 - 8
        expect(player.happiness).toBe(95); // 100 - 5
    });

    it('should give 10 credits instead of 8 if player has a Computer', () => {
        player.inventory.push({ name: 'Computer', cost: 800, happinessBoost: 25, type: 'asset', location: 'Consumpt-Zone' });
        gameState.takeCourse(1);
        gameState.study();
        expect(player.educationCredits).toBe(10);
    });

    it('should graduate when enough credits are accumulated', () => {
        const graduationHandler = vi.fn();
        EventBus.subscribe('graduation', graduationHandler);
        
        gameState.takeCourse(1); // Goal: 50
        
        // 7 sessions * 8 credits = 56 credits
        for (let i = 0; i < 7; i++) {
            player.time = 24; // Reset time for testing
            gameState.study();
        }
        
        expect(player.educationLevel).toBe(1);
        expect(player.educationCredits).toBe(0);
        expect(player.educationCreditsGoal).toBe(0); // Next goal (Intermed. Prod)
        expect(graduationHandler).toHaveBeenCalled();
        expect(gameState.log[0].text).toContain('Certification Achieved');

        // Verify Level 2 jobs are now available
        const availableJobs = (gameState as any)._getAvailableJobs(player);
        const hasLevel2Job = availableJobs.some((j: any) => j.level === 2);
        expect(hasLevel2Job).toBe(true);

        // Verify that after graduation, player must enroll again for Level 2
        player.time = 24;
        const result = gameState.study();
        expect(result).toBe(false);
        expect(gameState.log[0].text).toContain('must enroll in Intermed. Prod (Level 2)');

        // Enroll in Level 2
        player.cash = 1000;
        gameState.takeCourse(2);
        expect(player.educationCreditsGoal).toBe(120);
        expect(player.cash).toBe(0);

        // Now can study
        player.time = 24;
        const studyResult = gameState.study();
        expect(studyResult).toBe(true);
    });

    it('should prevent studying if happiness is too low', () => {
        player.happiness = 4;
        gameState.takeCourse(1);
        const result = gameState.study();
        expect(result).toBe(false);
        expect(gameState.log[0].text).toContain('Morale Quota is insufficient');
    });

    it('should prevent enrolling in higher levels without completing lower ones', () => {
        const result = gameState.takeCourse(2); // Intermed. Prod
        expect(result).toBe(false);
        expect(gameState.log[0].text).toContain('complete prior compliance tiers');
    });

    it('should update AI behavior to enroll and study', () => {
        gameState.currentPlayerIndex = 1; // Switch to AI player
        const aiPlayer = gameState.getCurrentPlayer();
        const aiController = gameState.aiController!;
        aiPlayer.isAI = true;
        aiPlayer.cash = 2000;
        aiPlayer.time = 24;
        aiPlayer.happiness = 100;
        aiPlayer.location = 'Hab-Pod 404';
        aiPlayer.educationLevel = 0;
        aiPlayer.educationCreditsGoal = 0;

        // First action: Travel to College
        let action = aiController.takeTurn(gameState, aiPlayer);
        expect(action.action).toBe('travel');
        expect(action.params.destination).toBe('Cognitive Re-Ed');

        aiPlayer.location = 'Cognitive Re-Ed';
        
        // Second action: Enroll
        action = aiController.takeTurn(gameState, aiPlayer);
        expect(action.action).toBe('takeCourse');
        expect(action.params.courseId).toBe(1);

        // Simulate enrollment
        gameState.takeCourse(1);

        // Third action: Study
        action = aiController.takeTurn(gameState, aiPlayer);
        expect(action.action).toBe('study');

        // Simulate graduating from Level 1
        aiPlayer.educationLevel = 1;
        aiPlayer.educationCredits = 0;
        aiPlayer.educationCreditsGoal = 0;
        aiPlayer.cash = 1500; // Enough for Intermed. Prod ($1000)

        // AI should try to enroll in Level 2
        action = aiController.takeTurn(gameState, aiPlayer);
        expect(action.action).toBe('takeCourse');
        expect(action.params.courseId).toBe(2);
    });
});
