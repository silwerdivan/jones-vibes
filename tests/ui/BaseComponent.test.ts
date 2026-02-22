import { describe, it, expect, beforeEach, vi } from 'vitest';
import BaseComponent from '../../src/ui/BaseComponent.js';
import EventBus from '../../src/EventBus.js';

interface TestState {
    value: string;
}

class ConcreteComponent extends BaseComponent<TestState> {
    render(state: TestState): void {
        this.element.textContent = state.value;
    }
}

describe('BaseComponent', () => {
    let component: ConcreteComponent;
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        component = new ConcreteComponent('div', 'test-class', 'test-id');
    });

    describe('constructor', () => {
        it('should create element with specified tag name', () => {
            const comp = new ConcreteComponent('section');
            expect(comp.getElement().tagName).toBe('SECTION');
        });

        it('should apply class name when provided', () => {
            const comp = new ConcreteComponent('div', 'my-class another-class');
            expect(comp.getElement().className).toBe('my-class another-class');
        });

        it('should apply id when provided', () => {
            const comp = new ConcreteComponent('div', 'class', 'my-id');
            expect(comp.getElement().id).toBe('my-id');
        });

        it('should work without class or id', () => {
            const comp = new ConcreteComponent('span');
            expect(comp.getElement().tagName).toBe('SPAN');
            expect(comp.getElement().className).toBe('');
            expect(comp.getElement().id).toBe('');
        });
    });

    describe('getElement', () => {
        it('should return the created element', () => {
            const element = component.getElement();
            expect(element).toBeInstanceOf(HTMLElement);
            expect(element.tagName).toBe('DIV');
        });
    });

    describe('mount', () => {
        it('should append element to parent', () => {
            component.mount(container);
            expect(container.contains(component.getElement())).toBe(true);
        });

        it('should set mounted flag to true', () => {
            expect(component.isMounted()).toBe(false);
            component.mount(container);
            expect(component.isMounted()).toBe(true);
        });

        it('should not duplicate mount if already mounted', () => {
            component.mount(container);
            const childCount = container.children.length;
            component.mount(container);
            expect(container.children.length).toBe(childCount);
        });
    });

    describe('unmount', () => {
        it('should remove element from parent', () => {
            component.mount(container);
            expect(container.contains(component.getElement())).toBe(true);
            component.unmount();
            expect(container.contains(component.getElement())).toBe(false);
        });

        it('should set mounted flag to false', () => {
            component.mount(container);
            expect(component.isMounted()).toBe(true);
            component.unmount();
            expect(component.isMounted()).toBe(false);
        });

        it('should do nothing if not mounted', () => {
            component.unmount();
            expect(component.isMounted()).toBe(false);
        });
    });

    describe('render', () => {
        it('should update element content based on state', () => {
            component.render({ value: 'Hello World' });
            expect(component.getElement().textContent).toBe('Hello World');
        });
    });

    describe('abstract behavior', () => {
        it('should require render method to be implemented', () => {
            class IncompleteComponent extends BaseComponent<unknown> {
                render(): void {
                    throw new Error('Not implemented');
                }
            }
            const comp = new IncompleteComponent('div');
            expect(() => comp.render()).toThrow('Not implemented');
        });
    });

    describe('subscribe', () => {
        it('should subscribe to EventBus events', () => {
            const handler = vi.fn();
            component.subscribe('testEvent', handler);
            EventBus.publish('testEvent', { value: 42 });
            expect(handler).toHaveBeenCalledWith({ value: 42 });
        });

        it('should track subscriptions', () => {
            const handler = vi.fn();
            component.subscribe('event1', handler);
            component.subscribe('event2', handler);
            const subs = component.getSubscriptions();
            expect(subs).toHaveLength(2);
            expect(subs[0].event).toBe('event1');
            expect(subs[1].event).toBe('event2');
        });

        it('should handle multiple handlers for same event', () => {
            const handler1 = vi.fn();
            const handler2 = vi.fn();
            component.subscribe('multiEvent', handler1);
            component.subscribe('multiEvent', handler2);
            EventBus.publish('multiEvent', 'data');
            expect(handler1).toHaveBeenCalledWith('data');
            expect(handler2).toHaveBeenCalledWith('data');
        });

        it('should return typed data to handler', () => {
            interface TestData {
                message: string;
                count: number;
            }
            const handler = vi.fn((data: TestData) => {
                return data.message;
            });
            component.subscribe<TestData>('typedEvent', handler);
            EventBus.publish('typedEvent', { message: 'hello', count: 5 });
            expect(handler).toHaveBeenCalledWith({ message: 'hello', count: 5 });
        });
    });

    describe('unsubscribeAll', () => {
        it('should clear all tracked subscriptions', () => {
            const handler = vi.fn();
            component.subscribe('event1', handler);
            component.subscribe('event2', handler);
            expect(component.getSubscriptions()).toHaveLength(2);
            component.unsubscribeAll();
            expect(component.getSubscriptions()).toHaveLength(0);
        });

        it('should track subscriptions but not unsubscribe from EventBus', () => {
            const handler = vi.fn();
            component.subscribe('persistentEvent', handler);
            component.unsubscribeAll();
            EventBus.publish('persistentEvent', 'still works');
            expect(handler).toHaveBeenCalledWith('still works');
        });
    });

    describe('unmount with subscriptions', () => {
        it('should call unsubscribeAll when unmounted', () => {
            const unsubscribeSpy = vi.spyOn(component, 'unsubscribeAll');
            component.mount(container);
            component.unmount();
            expect(unsubscribeSpy).toHaveBeenCalled();
        });

        it('should clear subscriptions on unmount', () => {
            const handler = vi.fn();
            component.subscribe('cleanupEvent', handler);
            component.mount(container);
            expect(component.getSubscriptions()).toHaveLength(1);
            component.unmount();
            expect(component.getSubscriptions()).toHaveLength(0);
        });
    });
});
