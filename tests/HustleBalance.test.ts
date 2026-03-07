import { describe, it, expect } from 'vitest';
import { HUSTLES } from '../src/data/hustles';
import { JOBS } from '../src/data/jobs';

describe('Hustle Balance', () => {
    it('hustles should beat entry-level shift pay on credits per hour', () => {
        const plasma = HUSTLES.find(h => h.id === 'donate-plasma');
        const scrap = HUSTLES.find(h => h.id === 'scrap-metal');
        const sanitation = JOBS.find(j => j.title === 'Sanitation-T3');

        expect(plasma).toBeDefined();
        expect(scrap).toBeDefined();
        expect(sanitation).toBeDefined();

        const plasmaEfficiency = plasma!.reward / plasma!.timeCost;
        const scrapEfficiency = scrap!.reward / scrap!.timeCost;
        const sanitationEfficiency = sanitation!.wage;

        expect(plasmaEfficiency).toBeGreaterThan(sanitationEfficiency);
        expect(scrapEfficiency).toBeGreaterThan(sanitationEfficiency);

        expect(plasmaEfficiency).toBe(42 / 4);
        expect(scrapEfficiency).toBe(38 / 4);
        expect(sanitationEfficiency).toBe(8);
    });

    it('plasma should remain the more punishing desperation option', () => {
        const plasma = HUSTLES.find(h => h.id === 'donate-plasma');
        const scrap = HUSTLES.find(h => h.id === 'scrap-metal');

        expect(plasma).toBeDefined();
        expect(scrap).toBeDefined();

        expect(plasma!.sanityCost).toBeGreaterThan(scrap!.sanityCost);
        expect(plasma!.risk).toBeGreaterThan(scrap!.risk);
    });
});
