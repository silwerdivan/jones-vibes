import { Hustle } from '../models/types';

export const HUSTLES: Hustle[] = [
    {
        id: 'donate-plasma',
        title: 'Donate Blood-Plasma',
        reward: 42,
        sanityCost: 8,
        timeCost: 4,
        risk: 0.2,
        consequenceId: 'plasma-infection',
        flavorText: 'A desperation-cash play: strong payout for a half-shift, but it leaves you hollow and exposed.'
    },
    {
        id: 'scrap-metal',
        title: 'Scrap Metal',
        reward: 38,
        sanityCost: 6,
        timeCost: 4,
        risk: 0.12,
        consequenceId: 'scrap-cut',
        flavorText: 'A quick cash-out when you cannot fit a full shift into the cycle.'
    }
];

