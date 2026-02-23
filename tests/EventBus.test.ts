import { describe, it, expect, vi, beforeEach } from 'vitest';
import EventBus from '../src/EventBus';

describe('EventBus', () => {
    beforeEach(() => {
        // Reset event bus internals for testing
        (EventBus as any).events = {};
    });

    it('should subscribe to and publish events', () => {
        const handler = vi.fn();
        const eventName = 'test-event';
        const data = { foo: 'bar' };

        EventBus.subscribe(eventName, handler);
        EventBus.publish(eventName, data);

        expect(handler).toHaveBeenCalledWith(data);
    });

    it('should handle multiple subscribers for the same event', () => {
        const handler1 = vi.fn();
        const handler2 = vi.fn();
        const eventName = 'test-event';

        EventBus.subscribe(eventName, handler1);
        EventBus.subscribe(eventName, handler2);
        EventBus.publish(eventName);

        expect(handler1).toHaveBeenCalled();
        expect(handler2).toHaveBeenCalled();
    });

    it('should unsubscribe a specific handler', () => {
        const handler1 = vi.fn();
        const handler2 = vi.fn();
        const eventName = 'test-event';

        EventBus.subscribe(eventName, handler1);
        EventBus.subscribe(eventName, handler2);
        
        // This method doesn't exist yet, it's what we're about to implement
        (EventBus as any).unsubscribe(eventName, handler1);
        
        EventBus.publish(eventName);

        expect(handler1).not.toHaveBeenCalled();
        expect(handler2).toHaveBeenCalled();
    });

    it('should do nothing if unsubscribing a non-existent event', () => {
        const handler = vi.fn();
        expect(() => (EventBus as any).unsubscribe('non-existent', handler)).not.toThrow();
    });

    it('should do nothing if unsubscribing a non-existent handler from an existing event', () => {
        const handler1 = vi.fn();
        const handler2 = vi.fn();
        const eventName = 'test-event';

        EventBus.subscribe(eventName, handler1);
        expect(() => (EventBus as any).unsubscribe(eventName, handler2)).not.toThrow();
        
        EventBus.publish(eventName);
        expect(handler1).toHaveBeenCalled();
    });
});
