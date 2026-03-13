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
    }
];

