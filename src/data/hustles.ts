import { Hustle } from '../models/types';

export const HUSTLES: Hustle[] = [
    {
        id: 'donate-plasma',
        title: 'Donate Blood-Plasma',
        reward: 100,
        sanityCost: 12,
        timeCost: 4,
        risk: 0.25,
        consequenceId: 'plasma-infection',
        flavorText: 'A desperation-cash play: high payout, but it leaves you hollow, drained, and physically exposed.'
    },
    {
        id: 'scrap-metal',
        title: 'Scrap Metal',
        reward: 85,
        sanityCost: 8,
        timeCost: 4,
        risk: 0.15,
        consequenceId: 'scrap-cut',
        flavorText: 'Back-breaking labor for quick credits. It is honest work, if you ignore the radiation burns.'
    },
    {
        id: 'data-snatch',
        title: 'Data Snatch',
        reward: 300,
        sanityCost: 20,
        timeCost: 2,
        risk: 0.40,
        consequenceId: 'data-snatch-caught',
        flavorText: 'High risk, massive reward. Crack a vulnerable node and sell the data before trace programs catch you.',
        availabilityChance: 0.15
    },
    {
        id: 'heist-getaway',
        title: 'Getaway Driver',
        reward: 800,
        sanityCost: 35,
        timeCost: 6,
        risk: 0.60,
        consequenceId: 'heist-arrest',
        flavorText: 'The big score. A crew needs a steady hand for a hot extraction. Extreme risk of incarceration.',
        availabilityChance: 0.05
    }
];

