import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { EventManager } from '../src/game/EventManager';
import GameState from '../src/game/GameState';
import Player from '../src/game/Player';
import EventBus from '../src/EventBus';
import { RANDOM_EVENTS } from '../src/data/randomEvents';

describe('EventManager', () => {
    let eventManager: EventManager;
    let gameState: GameState;
    let player: Player;

    beforeEach(() => {
        vi.restoreAllMocks();
        // Clear event bus subscribers to avoid side effects between tests
        EventBus.events = {};
        
        gameState = new GameState(1, false);
        player = gameState.getCurrentPlayer();
        player.isAI = false;
        eventManager = new EventManager();
        
        // Mock Math.random to be deterministic by default
        vi.spyOn(Math, 'random').mockReturnValue(0.5);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should initialize with events and history', () => {
        const history = ['event1', 'event2'];
        const manager = new EventManager(history);
        expect(manager.getHistory()).toEqual(history);
    });

    it('should not trigger events for AI players', () => {
        player.isAI = true;
        const publishSpy = vi.spyOn(EventBus, 'publish');
        
        eventManager.checkTriggers('Global', gameState);
        
        expect(publishSpy).not.toHaveBeenCalledWith('randomEventTriggered', expect.any(Object));
    });

    it('should trigger Global events (100% chance)', () => {
        const publishSpy = vi.spyOn(EventBus, 'publish');
        vi.spyOn(Math, 'random').mockReturnValue(0.99); // High value, but Global is 100%
        
        eventManager.checkTriggers('Global', gameState);
        
        expect(publishSpy).toHaveBeenCalledWith('randomEventTriggered', expect.any(Object));
    });

    it('should obey Local trigger chance (30%)', () => {
        const publishSpy = vi.spyOn(EventBus, 'publish');
        // Set location so some local events are available
        player.setLocation('Slums' as any);
        
        // 31% - should NOT trigger
        vi.spyOn(Math, 'random').mockReturnValue(0.31);
        eventManager.checkTriggers('Local', gameState);
        expect(publishSpy).not.toHaveBeenCalled();
        
        // 29% - should trigger
        vi.spyOn(Math, 'random').mockReturnValue(0.29);
        eventManager.checkTriggers('Local', gameState);
        expect(publishSpy).toHaveBeenCalled();
    });

    it('should respect prerequisites (location)', () => {
        const publishSpy = vi.spyOn(EventBus, 'publish');
        vi.spyOn(Math, 'random').mockReturnValue(0.01); // Force trigger chance
        
        // Prerequisites for local_fastfood_glitch is location: 'Slums'
        player.setLocation('Hab-Pod 404');
        eventManager.checkTriggers('Local', gameState);
        
        // Should not trigger because we are at Hab-Pod 404
        expect(publishSpy).not.toHaveBeenCalled();
        
        player.setLocation('Slums' as any);
        eventManager.checkTriggers('Local', gameState);
        expect(publishSpy).toHaveBeenCalled();
    });

    it('should respect cooldown (last 3 events)', () => {
        // Include ALL Global events in history to ensure NONE are triggered
        const globalEventIds = RANDOM_EVENTS.filter(e => e.type === 'Global').map(e => e.id);
        const managerWithHistory = new EventManager(globalEventIds);
        
        const publishSpy = vi.spyOn(EventBus, 'publish');
        vi.spyOn(Math, 'random').mockReturnValue(0.01);
        
        managerWithHistory.checkTriggers('Global', gameState);
        
        // Should NOT trigger because all matching events are in history
        expect(publishSpy).not.toHaveBeenCalled();
    });

    it('should apply choice effects (CASH)', () => {
        player.addCash(500); // Give cash so spendCash works
        const initialCash = player.cash;
        const event = RANDOM_EVENTS.find(e => e.id === 'global_transit_strike');
        if (!event) throw new Error('Event not found');
        
        // Choice 1: Bribe (-150)
        eventManager.applyChoice(event, 1, gameState);
        
        expect(player.cash).toBe(initialCash - 150);
    });

    it('should apply choice effects (CONDITION)', () => {
        const event = RANDOM_EVENTS.find(e => e.id === 'state_low_happiness_burnout');
        if (!event) throw new Error('Event not found');
        
        // Choice 1: Push (BRAIN_FOG)
        eventManager.applyChoice(event, 1, gameState);
        
        expect(player.hasCondition('BRAIN_FOG')).toBe(true);
    });

    it('should filter choices by requirement', () => {
        // Find an event with requirements
        const event = RANDOM_EVENTS.find(e => e.choices.some(c => c.requirement));
        if (!event) return; 

        let triggeredEvent: any = null;
        EventBus.subscribe('randomEventTriggered', (data) => {
            triggeredEvent = data.event;
        });

        player.inventory = [];
        vi.spyOn(Math, 'random').mockReturnValue(0.01);
        
        (eventManager as any).triggerEvent(event, gameState);
        
        expect(triggeredEvent).toBeDefined();
        // The choice with 'Car' or 'Computer' requirement should be filtered out
        const hasRequiredChoice = triggeredEvent.choices.some((c: any) => c.requirement !== undefined);
        expect(hasRequiredChoice).toBe(false);
    });

    it('should tick conditions via tickConditions', () => {
        player.addCondition({
            id: 'TEST',
            name: 'Test',
            description: 'Test',
            remainingDuration: 10,
            effects: [{ type: 'HAPPINESS_TICK', value: -1 }]
        });
        
        const initialHappiness = player.happiness;
        eventManager.tickConditions(player, 2);
        
        expect(player.happiness).toBe(initialHappiness - 2);
        expect(player.activeConditions[0].remainingDuration).toBe(8);
    });
});
