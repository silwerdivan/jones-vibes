import { describe, it, expect, beforeEach } from 'vitest';
import Gauge from '../../../../src/ui/components/shared/Gauge.js';

describe('Gauge', () => {
    let gauge: Gauge;

    beforeEach(() => {
        gauge = new Gauge();
    });

    describe('initialization', () => {
        it('should create a gauge container element', () => {
            const element = gauge.getElement();
            expect(element.tagName.toLowerCase()).toBe('div');
            expect(element.classList.contains('gauge-container')).toBe(true);
        });

        it('should be unmounted initially', () => {
            expect(gauge.isMounted()).toBe(false);
        });
    });

    describe('render', () => {
        it('should render gauge with correct label', () => {
            gauge.render({
                value: 75,
                color: '#00E676',
                label: 'Test Gauge'
            });

            const element = gauge.getElement();
            expect(element.querySelector('.gauge-label')?.textContent).toBe('Test Gauge');
        });

        it('should render percentage correctly', () => {
            gauge.render({
                value: 75,
                color: '#00E676',
                label: 'Test'
            });

            const element = gauge.getElement();
            expect(element.querySelector('.gauge-percentage')?.textContent).toBe('75%');
        });

        it('should render percentage with custom max value', () => {
            gauge.render({
                value: 50,
                max: 200,
                color: '#00E676',
                label: 'Test'
            });

            const element = gauge.getElement();
            expect(element.querySelector('.gauge-percentage')?.textContent).toBe('25%');
        });

        it('should clamp percentage at 100', () => {
            gauge.render({
                value: 150,
                max: 100,
                color: '#00E676',
                label: 'Test'
            });

            const element = gauge.getElement();
            expect(element.querySelector('.gauge-percentage')?.textContent).toBe('100%');
        });

        it('should clamp percentage at 0', () => {
            gauge.render({
                value: -10,
                max: 100,
                color: '#00E676',
                label: 'Test'
            });

            const element = gauge.getElement();
            expect(element.querySelector('.gauge-percentage')?.textContent).toBe('0%');
        });

        it('should create SVG element with correct viewBox', () => {
            gauge.render({
                value: 50,
                color: '#FF00FF',
                label: 'Test'
            });

            const element = gauge.getElement();
            const svg = element.querySelector('svg');
            expect(svg).not.toBeNull();
            expect(svg?.getAttribute('viewBox')).toBe('0 0 100 100');
        });

        it('should create two circles in SVG', () => {
            gauge.render({
                value: 50,
                color: '#00E676',
                label: 'Test'
            });

            const element = gauge.getElement();
            const circles = element.querySelectorAll('circle');
            expect(circles.length).toBe(2);
        });

        it('should apply background circle class', () => {
            gauge.render({
                value: 50,
                color: '#00E676',
                label: 'Test'
            });

            const element = gauge.getElement();
            const backgroundCircle = element.querySelector('.gauge-ring-background');
            expect(backgroundCircle).not.toBeNull();
        });

        it('should apply fill circle with correct color', () => {
            gauge.render({
                value: 75,
                color: '#FF00FF',
                label: 'Test'
            });

            const element = gauge.getElement();
            const fillCircle = element.querySelector('.gauge-ring-fill') as SVGCircleElement;
            expect(fillCircle).not.toBeNull();
            // Browser may convert hex to rgb, so check both formats
            const strokeColor = fillCircle?.style.stroke;
            expect(strokeColor === '#FF00FF' || strokeColor === 'rgb(255, 0, 255)').toBe(true);
        });

        it('should update when re-rendered with new values', () => {
            gauge.render({
                value: 50,
                color: '#00E676',
                label: 'Test'
            });

            gauge.render({
                value: 80,
                color: '#FF00FF',
                label: 'Updated'
            });

            const element = gauge.getElement();
            expect(element.querySelector('.gauge-percentage')?.textContent).toBe('80%');
            expect(element.querySelector('.gauge-label')?.textContent).toBe('Updated');
        });
    });

    describe('static create factory', () => {
        it('should create and return an HTMLElement', () => {
            const element = Gauge.create({
                value: 60,
                color: '#2979FF',
                label: 'Factory Test'
            });

            expect(element).toBeInstanceOf(HTMLElement);
            expect(element.classList.contains('gauge-container')).toBe(true);
        });

        it('should render correctly using factory', () => {
            const element = Gauge.create({
                value: 90,
                color: '#00E676',
                label: 'Factory Gauge'
            });

            expect(element.querySelector('.gauge-label')?.textContent).toBe('Factory Gauge');
            expect(element.querySelector('.gauge-percentage')?.textContent).toBe('90%');
        });
    });

    describe('mount/unmount', () => {
        it('should mount to parent element', () => {
            const parent = document.createElement('div');
            gauge.render({ value: 50, color: '#00E676', label: 'Test' });
            gauge.mount(parent);

            expect(parent.contains(gauge.getElement())).toBe(true);
            expect(gauge.isMounted()).toBe(true);
        });

        it('should unmount from DOM', () => {
            const parent = document.createElement('div');
            gauge.render({ value: 50, color: '#00E676', label: 'Test' });
            gauge.mount(parent);
            gauge.unmount();

            expect(parent.contains(gauge.getElement())).toBe(false);
            expect(gauge.isMounted()).toBe(false);
        });
    });

    describe('edge cases', () => {
        it('should handle zero value', () => {
            gauge.render({
                value: 0,
                color: '#00E676',
                label: 'Empty'
            });

            const element = gauge.getElement();
            expect(element.querySelector('.gauge-percentage')?.textContent).toBe('0%');
        });

        it('should handle zero max value by returning 0%', () => {
            gauge.render({
                value: 50,
                max: 0,
                color: '#00E676',
                label: 'Test'
            });

            const element = gauge.getElement();
            expect(element.querySelector('.gauge-percentage')?.textContent).toBe('0%');
        });

        it('should round percentages correctly', () => {
            gauge.render({
                value: 33.7,
                max: 100,
                color: '#00E676',
                label: 'Test'
            });

            const element = gauge.getElement();
            expect(element.querySelector('.gauge-percentage')?.textContent).toBe('34%');
        });
    });
});
