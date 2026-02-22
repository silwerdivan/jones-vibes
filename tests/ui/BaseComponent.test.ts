import { describe, it, expect, beforeEach, vi } from 'vitest';
import BaseComponent from '../../src/ui/BaseComponent.js';

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
});
