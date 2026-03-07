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
        player.setLocation('Labor Sector' as any);
        
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
        
        // Prerequisites for local_fastfood_glitch is location: 'Labor Sector'
        player.setLocation('Hab-Pod 404');
        eventManager.checkTriggers('Local', gameState);
        
        // Should not trigger because we are at Hab-Pod 404
        expect(publishSpy).not.toHaveBeenCalled();
        
        player.setLocation('Labor Sector' as any);
        eventManager.checkTriggers('Local', gameState);
        expect(publishSpy).toHaveBeenCalled();
    });

    it('should respect cooldown (last 3 events)', () => {
        // Find 3 global events to put in history
        const globalEvents = RANDOM_EVENTS.filter(e => e.type === 'Global');
        const testEventIds = globalEvents.slice(0, 3).map(e => e.id);
        
        // Create manager with these 3 in history
        const managerWithHistory = new EventManager(testEventIds);
        
        // Mock Math.random to return the FIRST global event (which is in history)
        vi.spyOn(Math, 'random').mockReturnValue(0.001);
        
        // We need to ensure availableEvents doesn't include any OTHER global events that might be triggered
        // by our fixed random value.
        // Actually, checkTriggers picks randomly from ALL available.
        // If we put ALL global events in history, and history length > 3,
        // then only the LAST 3 are actually blocking.
        
        // So let's mock the internal filter or just ensure history is long enough.
        // But the code says: this.eventHistory.slice(-3).includes(event.id)
        
        // Let's just mock the available events or the trigger logic if it's too complex to setup perfectly.
        // OR: Just ensure we know WHICH one will be picked.
        
        const publishSpy = vi.spyOn(EventBus, 'publish');
        
        // If we put the entire RANDOM_EVENTS list in history, then only the last 3 are blocked.
        // That's the intended behavior of the code.
        // The test should verify that the ones in the last 3 ARE blocked.
        
        const blockedEventId = testEventIds[2]; // The most recent one
        
        // Mocking availableEvents is hard as it's local.
        // Let's just verify that if an event IS in the last 3, it's NOT in availableEvents.
        
        // For the sake of the test, let's just use 3 events in total.
        const originalEvents = (managerWithHistory as any).events;
        (managerWithHistory as any).events = globalEvents.slice(0, 3);
        
        managerWithHistory.checkTriggers('Global', gameState);
        
        expect(publishSpy).not.toHaveBeenCalledWith('randomEventTriggered', expect.any(Object));
        
        // Restore
        (managerWithHistory as any).events = originalEvents;
    });

    it('should apply choice effects (CREDITS)', () => {
        player.addCredits(500); // Give credits so spendCredits works
        const initialCredits = player.credits;
        const event = RANDOM_EVENTS.find(e => e.id === 'global_transit_strike');
        if (!event) throw new Error('Event not found');
        
        // Choice 1: Bribe (-150)
        eventManager.applyChoice(event, 1, gameState);
        
        expect(player.credits).toBe(initialCredits - 150);
    });

    it('should apply choice effects (CONDITION)', () => {
        const event = RANDOM_EVENTS.find(e => e.id === 'state_low_sanity_burnout');
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
            effects: [{ type: 'SANITY_TICK', value: -1 }]
        });
        
        const initialSanity = player.sanity;
        eventManager.tickConditions(player, 2);
        
        expect(player.sanity).toBe(initialSanity - 2);
        expect(player.activeConditions[0].remainingDuration).toBe(8);
    });

    it('should correctly filter choices based on CAR requirement', () => {
        const event = RANDOM_EVENTS.find(e => e.id === 'global_transit_strike');
        if (!event) throw new Error('Transit Strike event not found');

        let triggeredEvent: any = null;
        const unsubscribe = EventBus.subscribe('randomEventTriggered', (data) => {
            triggeredEvent = data.event;
        });

        // Test without car
        player.hasCar = false;
        (eventManager as any).triggerEvent(event, gameState);
        
        expect(triggeredEvent).toBeDefined();
        let hasCarChoice = triggeredEvent.choices.some((c: any) => c.text.includes('Car:'));
        expect(hasCarChoice).toBe(false);

        // Test with car
        player.hasCar = true;
        (eventManager as any).triggerEvent(event, gameState);
        
        hasCarChoice = triggeredEvent.choices.some((c: any) => c.text.includes('Car:'));
        expect(hasCarChoice).toBe(true);

        unsubscribe();
    });
});
