import EventBus from '../EventBus.js';

type Subscription = {
    event: string;
    handler: (data: any) => void;
};

type PerformanceMetrics = {
    renderCount: number;
    totalRenderTime: number;
    lastRenderTime: number;
    maxRenderTime: number;
    minRenderTime: number;
};

const PERF_THRESHOLD = 16; // 16ms = 60fps target
const PERF_WARNING_THRESHOLD = 33; // 33ms = 30fps warning level

export default abstract class BaseComponent<T = unknown> {
    protected element: HTMLElement;
    protected mounted: boolean = false;
    private subscriptions: Subscription[] = [];
    private performanceMetrics: PerformanceMetrics = {
        renderCount: 0,
        totalRenderTime: 0,
        lastRenderTime: 0,
        maxRenderTime: 0,
        minRenderTime: Infinity
    };
    private componentName: string;

    constructor(tagName: string, className?: string, id?: string) {
        this.element = document.createElement(tagName);
        if (className) {
            this.element.className = className;
        }
        if (id) {
            this.element.id = id;
        }
        this.componentName = this.constructor.name;
    }

    public render(state: T): void {
        const startTime = performance.now();
        
        this._render(state);
        
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        this.performanceMetrics.renderCount++;
        this.performanceMetrics.lastRenderTime = renderTime;
        this.performanceMetrics.totalRenderTime += renderTime;
        this.performanceMetrics.maxRenderTime = Math.max(this.performanceMetrics.maxRenderTime, renderTime);
        this.performanceMetrics.minRenderTime = Math.min(this.performanceMetrics.minRenderTime, renderTime);
        
        this._logPerformance(renderTime);
    }

    protected abstract _render(state: T): void;

    getElement(): HTMLElement {
        return this.element;
    }

    mount(parent: HTMLElement): void {
        if (this.mounted) {
            return;
        }
        parent.appendChild(this.element);
        this.mounted = true;
    }

    unmount(): void {
        if (!this.mounted || !this.element.parentElement) {
            return;
        }
        this.element.parentElement.removeChild(this.element);
        this.mounted = false;
        this.unsubscribeAll();
    }

    isMounted(): boolean {
        return this.mounted;
    }

    subscribe<E>(event: string, handler: (data: E) => void): void {
        EventBus.subscribe(event, handler);
        this.subscriptions.push({ event, handler });
    }

    unsubscribeAll(): void {
        this.subscriptions = [];
    }

    getSubscriptions(): Subscription[] {
        return [...this.subscriptions];
    }

    private _logPerformance(renderTime: number): void {
        if (renderTime > PERF_WARNING_THRESHOLD) {
            console.warn(
                `[${this.componentName}] Slow render detected: ${renderTime.toFixed(2)}ms ` +
                `(threshold: ${PERF_WARNING_THRESHOLD}ms). ` +
                `This may cause frame drops below 30fps.`
            );
        } else if (renderTime > PERF_THRESHOLD) {
            console.log(
                `[${this.componentName}] Render time: ${renderTime.toFixed(2)}ms ` +
                `(threshold: ${PERF_THRESHOLD}ms). ` +
                `Above 60fps target.`
            );
        }
    }

    getPerformanceMetrics(): PerformanceMetrics {
        return { ...this.performanceMetrics };
    }

    resetPerformanceMetrics(): void {
        this.performanceMetrics = {
            renderCount: 0,
            totalRenderTime: 0,
            lastRenderTime: 0,
            maxRenderTime: 0,
            minRenderTime: Infinity
        };
    }
}
