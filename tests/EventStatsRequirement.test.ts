import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { EventManager } from '../src/game/EventManager';
import GameState from '../src/game/GameState';
import Player from '../src/game/Player';
import EventBus from '../src/EventBus';
import { RANDOM_EVENTS } from '../src/data/randomEvents';

describe('EventManager STAT Requirements', () => {
    let eventManager: EventManager;
    let gameState: GameState;
    let player: Player;

    beforeEach(() => {
        vi.restoreAllMocks();
        EventBus.events = {};
        
        gameState = new GameState(1, false);
        player = gameState.getCurrentPlayer();
        player.isAI = false;
        eventManager = new EventManager();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should respect SANITY requirement in choices', () => {
        const event = RANDOM_EVENTS.find(e => e.id === 'global_maglev_panic');
        if (!event) throw new Error('Event not found');

        let triggeredEvent: any = null;
        EventBus.subscribe('randomEventTriggered', (data) => {
            triggeredEvent = data.event;
        });

        // Case 1: Low sanity (40), requirement for Choice 0 is 60
        player.updateSanity(-10); // Start at 50, now 40
        (eventManager as any).triggerEvent(event, gameState);
        
        expect(triggeredEvent).toBeDefined();
        // Choice 0 (Control) should be filtered out
        expect(triggeredEvent.choices.find((c: any) => c.text.includes('Control'))).toBeUndefined();

        // Case 2: High sanity (70)
        player.updateSanity(30); // 40 + 30 = 70
        (eventManager as any).triggerEvent(event, gameState);
        
        // Choice 0 (Control) should be present
        expect(triggeredEvent.choices.find((c: any) => c.text.includes('Control'))).toBeDefined();
    });

    it('should respect TIME requirement in choices', () => {
        const event = RANDOM_EVENTS.find(e => e.id === 'local_shady_courier');
        if (!event) throw new Error('Event not found');

        let triggeredEvent: any = null;
        EventBus.subscribe('randomEventTriggered', (data) => {
            triggeredEvent = data.event;
        });

        // Case 1: Low time (2), requirement for Choice 0 is 4
        player.setTime(2);
        (eventManager as any).triggerEvent(event, gameState);
        
        expect(triggeredEvent).toBeDefined();
        // Choice 0 (Accept) should be filtered out
        expect(triggeredEvent.choices.find((c: any) => c.text.includes('Accept'))).toBeUndefined();

        // Case 2: High time (10)
        player.setTime(10);
        (eventManager as any).triggerEvent(event, gameState);
        
        // Choice 0 (Accept) should be present
        expect(triggeredEvent.choices.find((c: any) => c.text.includes('Accept'))).toBeDefined();
    });

    it('should respect CREDITS requirement in choices', () => {
        const event = RANDOM_EVENTS.find(e => e.id === 'local_black_market_biosync');
        if (!event) throw new Error('Event not found');

        let triggeredEvent: any = null;
        EventBus.subscribe('randomEventTriggered', (data) => {
            triggeredEvent = data.event;
        });

        // Case 1: Low credits (100), requirement for Choice 0 is 500
        player.credits = 100;
        (eventManager as any).triggerEvent(event, gameState);
        
        expect(triggeredEvent).toBeDefined();
        // Choice 0 (Sync) should be filtered out
        expect(triggeredEvent.choices.find((c: any) => c.text.includes('Sync'))).toBeUndefined();

        // Case 2: High credits (1000)
        player.credits = 1000;
        (eventManager as any).triggerEvent(event, gameState);
        
        // Choice 0 (Sync) should be present
        expect(triggeredEvent.choices.find((c: any) => c.text.includes('Sync'))).toBeDefined();
    });
});
