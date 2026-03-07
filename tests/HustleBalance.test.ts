import { describe, it, expect } from 'vitest';
import { HUSTLES } from '../src/data/hustles';
import { JOBS } from '../src/data/jobs';

describe('Hustle Balance', () => {
    it('Donate Blood-Plasma efficiency should be worse than Sanitation-T3', () => {
        const plasma = HUSTLES.find(h => h.id === 'donate-plasma');
        const sanitation = JOBS.find(j => j.title === 'Sanitation-T3');

        expect(plasma).toBeDefined();
        expect(sanitation).toBeDefined();

        const plasmaEfficiency = plasma!.reward / plasma!.timeCost;
        const sanitationEfficiency = sanitation!.wage; // wage is credits/hour

        expect(plasmaEfficiency).toBeLessThan(sanitationEfficiency);
        
        // Assert specific values based on our nerf
        expect(plasmaEfficiency).toBe(25 / 4); // 6.25
        expect(sanitationEfficiency).toBe(8);
    });
});
