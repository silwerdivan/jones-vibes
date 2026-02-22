import BaseComponent from '../../BaseComponent.js';

export interface GaugeConfig {
    value: number;
    max?: number;
    color: string;
    label: string;
}

export default class Gauge extends BaseComponent<GaugeConfig> {
    private static readonly RADIUS = 45;
    private static readonly VIEWBOX_SIZE = 100;

    constructor() {
        super('div', 'gauge-container');
    }

    protected _render(config: GaugeConfig): void {
        const { value, max = 100, color, label } = config;
        const rawPercentage = max === 0 ? 0 : (value / max) * 100;
        const percentage = Math.min(100, Math.max(0, Math.round(rawPercentage)));
        
        const radius = Gauge.RADIUS;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;

        this.element.innerHTML = `
            <div class="gauge-label">${label}</div>
            <svg viewBox="0 0 ${Gauge.VIEWBOX_SIZE} ${Gauge.VIEWBOX_SIZE}" class="gauge-svg">
                <circle class="gauge-ring-background" cx="50" cy="50" r="${radius}"></circle>
                <circle class="gauge-ring-fill" cx="50" cy="50" r="${radius}" 
                        style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${offset}; stroke: ${color};">
                </circle>
            </svg>
            <div class="gauge-percentage">${percentage}%</div>
        `;
    }

    /**
     * Factory function to quickly create and render a gauge
     */
    static create(config: GaugeConfig): HTMLElement {
        const gauge = new Gauge();
        gauge._render(config);
        return gauge.getElement();
    }
}
