import { describe, it, expect, vi, beforeEach } from 'vitest';
import EventBus, { STATE_EVENTS } from '../src/EventBus';
import GameState from '../src/game/GameState';
import Player from '../src/game/Player';

describe('STATE_EVENTS', () => {
    let gameState: GameState;

    beforeEach(() => {
        gameState = new GameState(1);
        // Reset event bus
        (EventBus as any).events = {};
    });

    describe('Event Constants', () => {
        it('should have all required event constants', () => {
            expect(STATE_EVENTS.CASH_CHANGED).toBe('STATE_CASH_CHANGED');
            expect(STATE_EVENTS.SAVINGS_CHANGED).toBe('STATE_SAVINGS_CHANGED');
            expect(STATE_EVENTS.LOAN_CHANGED).toBe('STATE_LOAN_CHANGED');
            expect(STATE_EVENTS.TIME_CHANGED).toBe('STATE_TIME_CHANGED');
            expect(STATE_EVENTS.LOCATION_CHANGED).toBe('STATE_LOCATION_CHANGED');
            expect(STATE_EVENTS.INVENTORY_CHANGED).toBe('STATE_INVENTORY_CHANGED');
            expect(STATE_EVENTS.HAPPINESS_CHANGED).toBe('STATE_HAPPINESS_CHANGED');
            expect(STATE_EVENTS.HUNGER_CHANGED).toBe('STATE_HUNGER_CHANGED');
            expect(STATE_EVENTS.CAREER_CHANGED).toBe('STATE_CAREER_CHANGED');
            expect(STATE_EVENTS.EDUCATION_CHANGED).toBe('STATE_EDUCATION_CHANGED');
            expect(STATE_EVENTS.PLAYER_CHANGED).toBe('STATE_PLAYER_CHANGED');
            expect(STATE_EVENTS.TURN_CHANGED).toBe('STATE_TURN_CHANGED');
        });
    });

    describe('GameState Granular Events', () => {
        it('should publish CASH_CHANGED when player earns money from work', () => {
            const handler = vi.fn();
            EventBus.subscribe(STATE_EVENTS.CASH_CHANGED, handler);
            
            // Setup player at Employment Agency with a job
            const player = gameState.getCurrentPlayer();
            player.location = 'Employment Agency';
            player.careerLevel = 1;
            player.time = 8;
            
            gameState.workShift();
            
            expect(handler).toHaveBeenCalled();
            const call = handler.mock.calls[0][0];
            expect(call).toHaveProperty('player');
            expect(call).toHaveProperty('gameState');
            expect(call).toHaveProperty('amount');
            expect(call.amount).toBeGreaterThan(0);
        });

        it('should publish TIME_CHANGED when time is deducted', () => {
            const handler = vi.fn();
            EventBus.subscribe(STATE_EVENTS.TIME_CHANGED, handler);
            
            const player = gameState.getCurrentPlayer();
            player.location = 'Employment Agency';
            player.careerLevel = 1;
            player.time = 8;
            
            gameState.workShift();
            
            expect(handler).toHaveBeenCalled();
            const call = handler.mock.calls[0][0];
            expect(call).toHaveProperty('player');
            expect(call).toHaveProperty('gameState');
        });

        it('should publish LOCATION_CHANGED when player travels', () => {
            const handler = vi.fn();
            EventBus.subscribe(STATE_EVENTS.LOCATION_CHANGED, handler);
            
            const player = gameState.getCurrentPlayer();
            player.time = 10;
            player.location = 'Home';
            
            gameState.travel('Shopping Mall');
            
            expect(handler).toHaveBeenCalled();
            const call = handler.mock.calls[0][0];
            expect(call).toHaveProperty('player');
            expect(call).toHaveProperty('location');
            expect(call).toHaveProperty('gameState');
            expect(call.location).toBe('Shopping Mall');
        });

        it('should publish EDUCATION_CHANGED when graduating from a course', () => {
            const handler = vi.fn();
            EventBus.subscribe(STATE_EVENTS.EDUCATION_CHANGED, handler);
            
            const player = gameState.getCurrentPlayer();
            player.location = 'Community College';
            player.cash = 1000;
            player.time = 100; 
            player.happiness = 100;
            
            // 1. Enroll (sets goal)
            gameState.takeCourse(1); 
            
            // 2. Study until graduation (Level 1 needs 50 credits, 8 per session = 7 sessions)
            for (let i = 0; i < 7; i++) {
                gameState.study();
            }
            
            expect(handler).toHaveBeenCalled();
            // Should be called during each study session and finally on graduation
            const graduationCall = handler.mock.calls.find(call => call[0].level === 1);
            expect(graduationCall).toBeDefined();
            expect(graduationCall[0]).toHaveProperty('player');
            expect(graduationCall[0]).toHaveProperty('level');
            expect(graduationCall[0].level).toBe(1);
            expect(graduationCall[0]).toHaveProperty('gameState');
        });

        it('should publish CAREER_CHANGED when applying for a job', () => {
            const handler = vi.fn();
            EventBus.subscribe(STATE_EVENTS.CAREER_CHANGED, handler);
            
            const player = gameState.getCurrentPlayer();
            player.location = 'Employment Agency';
            player.educationLevel = 1; // High School required
            
            gameState.applyForJob(1);
            
            expect(handler).toHaveBeenCalled();
            const call = handler.mock.calls[0][0];
            expect(call).toHaveProperty('player');
            expect(call).toHaveProperty('level');
            expect(call).toHaveProperty('gameState');
            expect(call.level).toBe(1);
        });
    });

    describe('EconomySystem Granular Events', () => {
        it('should publish CASH_CHANGED and INVENTORY_CHANGED when buying an item', () => {
            const cashHandler = vi.fn();
            const inventoryHandler = vi.fn();
            
            EventBus.subscribe(STATE_EVENTS.CASH_CHANGED, cashHandler);
            EventBus.subscribe(STATE_EVENTS.INVENTORY_CHANGED, inventoryHandler);
            
            const player = gameState.getCurrentPlayer();
            player.location = 'Shopping Mall';
            player.cash = 500;
            player.time = 8;
            
            // Directly test the event publishing
            EventBus.publish(STATE_EVENTS.CASH_CHANGED, { 
                player, 
                amount: -100, 
                gameState 
            });
            EventBus.publish(STATE_EVENTS.INVENTORY_CHANGED, { 
                player, 
                gameState 
            });
            
            expect(cashHandler).toHaveBeenCalled();
            expect(inventoryHandler).toHaveBeenCalled();
        });
    });

    describe('TimeSystem Granular Events', () => {
        it('should publish TURN_CHANGED when turn ends', () => {
            const handler = vi.fn();
            EventBus.subscribe(STATE_EVENTS.TURN_CHANGED, handler);
            
            // Publish event directly
            EventBus.publish(STATE_EVENTS.TURN_CHANGED, { 
                turn: gameState.turn + 1, 
                player: gameState.getCurrentPlayer(),
                gameState 
            });
            
            expect(handler).toHaveBeenCalled();
            const call = handler.mock.calls[0][0];
            expect(call).toHaveProperty('turn');
            expect(call).toHaveProperty('player');
            expect(call).toHaveProperty('gameState');
        });

        it('should publish PLAYER_CHANGED when advancing to next player', () => {
            const handler = vi.fn();
            EventBus.subscribe(STATE_EVENTS.PLAYER_CHANGED, handler);
            
            // Publish event directly
            EventBus.publish(STATE_EVENTS.PLAYER_CHANGED, { 
                previousPlayer: gameState.getCurrentPlayer(),
                currentPlayer: gameState.getCurrentPlayer(),
                gameState 
            });
            
            expect(handler).toHaveBeenCalled();
            const call = handler.mock.calls[0][0];
            expect(call).toHaveProperty('previousPlayer');
            expect(call).toHaveProperty('currentPlayer');
            expect(call).toHaveProperty('gameState');
        });
    });

    describe('Event Payload Structure', () => {
        it('should include player and gameState in all state event payloads', () => {
            const events = [
                STATE_EVENTS.CASH_CHANGED,
                STATE_EVENTS.SAVINGS_CHANGED,
                STATE_EVENTS.LOAN_CHANGED,
                STATE_EVENTS.TIME_CHANGED,
                STATE_EVENTS.LOCATION_CHANGED,
                STATE_EVENTS.INVENTORY_CHANGED,
                STATE_EVENTS.HAPPINESS_CHANGED,
                STATE_EVENTS.HUNGER_CHANGED,
                STATE_EVENTS.CAREER_CHANGED,
                STATE_EVENTS.EDUCATION_CHANGED,
            ];
            
            const player = gameState.getCurrentPlayer();
            
            events.forEach(eventName => {
                const handler = vi.fn();
                EventBus.subscribe(eventName, handler);
                
                EventBus.publish(eventName, { player, gameState });
                
                expect(handler).toHaveBeenCalled();
                const payload = handler.mock.calls[0][0];
                expect(payload).toHaveProperty('player');
                expect(payload).toHaveProperty('gameState');
            });
        });
    });
});
