import { describe, it, expect, beforeEach } from 'vitest';
import Player from '../src/game/Player';
import { CONDITIONS } from '../src/data/conditions';

describe('Player Conditions', () => {
    let player: Player;

    beforeEach(() => {
        player = new Player(1);
    });

    it('should add a condition correctly', () => {
        const condition = { ...CONDITIONS['SORE_LEGS'] };
        player.addCondition(condition);
        
        expect(player.activeConditions.length).toBe(1);
        expect(player.activeConditions[0].id).toBe('SORE_LEGS');
        expect(player.hasCondition('SORE_LEGS')).toBe(true);
    });

    it('should replace an existing condition with the same ID', () => {
        const condition1 = { ...CONDITIONS['SORE_LEGS'], remainingDuration: 10 };
        player.addCondition(condition1);
        
        const condition2 = { ...CONDITIONS['SORE_LEGS'], remainingDuration: 20 };
        player.addCondition(condition2);
        
        expect(player.activeConditions.length).toBe(1);
        expect(player.activeConditions[0].remainingDuration).toBe(20);
    });

    it('should remove a condition correctly', () => {
        player.addCondition({ ...CONDITIONS['SORE_LEGS'] });
        player.removeCondition('SORE_LEGS');
        
        expect(player.activeConditions.length).toBe(0);
        expect(player.hasCondition('SORE_LEGS')).toBe(false);
    });

    it('should calculate modified stats correctly (multipliers)', () => {
        // Base wage is 1.0 (default)
        expect(player.wageMultiplier).toBe(1.0);
        
        // Add BRAIN_FOG (0.8x wage)
        player.addCondition({ ...CONDITIONS['BRAIN_FOG'] });
        expect(player.wageMultiplier).toBeCloseTo(0.8);
        
        // Add FAVOR_WITH_BOSS (1.2x wage)
        // Combined should be 0.8 * 1.2 = 0.96
        player.addCondition({ ...CONDITIONS['FAVOR_WITH_BOSS'] });
        expect(player.wageMultiplier).toBeCloseTo(0.96);
    });

    it('should apply travel time modifiers', () => {
        const baseTravelTime = 1.0;
        
        // No conditions
        expect(player.getModifiedStat('TRAVEL_TIME_MODIFIER', baseTravelTime)).toBe(1.0);
        
        // SORE_LEGS (1.5x travel time)
        player.addCondition({ ...CONDITIONS['SORE_LEGS'] });
        expect(player.getModifiedStat('TRAVEL_TIME_MODIFIER', baseTravelTime)).toBe(1.5);
    });

    it('should tick conditions and remove expired ones', () => {
        const condition = { ...CONDITIONS['HYPER_FOCUS'], remainingDuration: 5 };
        player.addCondition(condition);
        
        player.tickConditions(2);
        expect(player.activeConditions[0].remainingDuration).toBe(3);
        
        player.tickConditions(4);
        expect(player.activeConditions.length).toBe(0);
    });

    it('should serialize and deserialize conditions correctly', () => {
        player.addCondition({ ...CONDITIONS['SORE_LEGS'], remainingDuration: 100 });
        
        const json = player.toJSON();
        const restoredPlayer = Player.fromJSON(json);
        
        expect(restoredPlayer.activeConditions.length).toBe(1);
        expect(restoredPlayer.activeConditions[0].id).toBe('SORE_LEGS');
        expect(restoredPlayer.activeConditions[0].remainingDuration).toBe(100);
    });
});
