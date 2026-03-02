import { Item } from '../models/types';

export const SHOPPING_ITEMS: Item[] = [
    { name: 'Focus-Fluids', cost: 5, happinessBoost: 5, type: 'essential', location: 'Consumpt-Zone' },
    { name: 'Prop-Reel Tkt', cost: 15, happinessBoost: 10, type: 'essential', location: 'Consumpt-Zone' },
    { name: 'Uniform-Patch', cost: 50, happinessBoost: 20, type: 'essential', icon: 'clothes', benefit: 'Social Standing +5%', location: 'Consumpt-Zone' },
    { name: 'Concert Ticket', cost: 100, happinessBoost: 30, type: 'essential', location: 'Consumpt-Zone' },
    { name: 'Omni-Chill', cost: 400, happinessBoost: 10, type: 'asset', icon: 'fridge', benefit: 'Bio-Deficit Rate -50%', location: 'Consumpt-Zone' },
    { name: 'Hypno-Screen', cost: 600, happinessBoost: 40, type: 'asset', icon: 'television', benefit: 'Morale Bonus +10%', location: 'Consumpt-Zone' },
    { name: 'Computer', cost: 800, happinessBoost: 25, type: 'asset', icon: 'computer', benefit: 'Study Speed +15%', location: 'Consumpt-Zone' },
    { name: 'Vacation Package', cost: 500, happinessBoost: 50, type: 'essential', location: 'Consumpt-Zone' },
    { name: 'Bio-Block-01', cost: 10, happinessBoost: 5, type: 'essential', hungerReduction: 40, location: 'Sustenance Hub' },
    { name: 'Synth-Salad', cost: 12, happinessBoost: 8, type: 'essential', hungerReduction: 30, location: 'Sustenance Hub' }
];
