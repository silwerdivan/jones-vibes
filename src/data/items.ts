import { Item } from '../models/types';

export const SHOPPING_ITEMS: Item[] = [
    { name: 'Coffee', cost: 5, happinessBoost: 5, type: 'essential', location: 'Shopping Mall' },
    { name: 'Movie Ticket', cost: 15, happinessBoost: 10, type: 'essential', location: 'Shopping Mall' },
    { name: 'New Clothes', cost: 50, happinessBoost: 20, type: 'essential', icon: 'clothes', benefit: 'Social Standing +5%', location: 'Shopping Mall' },
    { name: 'Concert Ticket', cost: 100, happinessBoost: 30, type: 'essential', location: 'Shopping Mall' },
    { name: 'Fridge', cost: 400, happinessBoost: 10, type: 'asset', icon: 'fridge', benefit: 'Food Waste -50%', location: 'Shopping Mall' },
    { name: 'Television', cost: 600, happinessBoost: 40, type: 'asset', icon: 'television', benefit: 'Relaxation +10%', location: 'Shopping Mall' },
    { name: 'Computer', cost: 800, happinessBoost: 25, type: 'asset', icon: 'computer', benefit: 'Study Speed +15%', location: 'Shopping Mall' },
    { name: 'Vacation Package', cost: 500, happinessBoost: 50, type: 'essential', location: 'Shopping Mall' },
    { name: 'Monolith Burger', cost: 10, happinessBoost: 5, type: 'essential', hungerReduction: 40, location: 'Fast Food' },
    { name: 'Synth-Salad', cost: 12, happinessBoost: 8, type: 'essential', hungerReduction: 30, location: 'Fast Food' }
];
