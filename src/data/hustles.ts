import { Hustle } from '../models/types';

export const HUSTLES: Hustle[] = [
    {
        id: 'donate-plasma',
        title: 'Donate Blood-Plasma',
        reward: 25,
        sanityCost: 15,
        timeCost: 4,
        risk: 0.15,
        consequenceId: 'plasma-infection',
        flavorText: 'The extraction is slow and leaves you feeling light-headed and hollow.'
    },
    {
        id: 'scrap-metal',
        title: 'Scrap Metal',
        reward: 30,
        sanityCost: 2,
        timeCost: 4,
        risk: 0.05,
        consequenceId: 'scrap-cut',
        flavorText: 'Rummaging through the industrial waste for anything salvageable.'
    }
];
