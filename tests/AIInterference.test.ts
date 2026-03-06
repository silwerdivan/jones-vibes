import { describe, it, expect } from 'vitest';
import GameState from '../src/game/GameState';

describe('AI Interference Reproduction', () => {
    it('should ignore player actions when AI is thinking', () => {
        const gameState = new GameState(2, true); // 2 players, P2 is AI
        const player = gameState.getCurrentPlayer();
        
        // Setup player state
        player.location = 'Labor Sector';
        player.careerLevel = 1; // Sanitation-T3 (requires educationLevel 0)
        const initialTime = player.time;
        
        // Set AI Thinking state (normally set during P2's turn)
        gameState.isAIThinking = true;
        
        // Attempt player action
        const success = gameState.workShift();
        
        // ASSERT: Action should be ignored.
        // EXPECTED TO FAIL: current logic allows it, so success will be true and time will be deducted.
        expect(success).toBe(false);
        expect(player.time).toBe(initialTime);
    });
});
