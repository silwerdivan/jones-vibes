import { Item } from '../models/types';

export const SHOPPING_ITEMS: Item[] = [
    { name: 'Focus-Fluids', cost: 5, sanityBoost: 5, type: 'essential', location: 'Consumpt-Zone' },
    { name: 'Prop-Reel Tkt', cost: 15, sanityBoost: 10, type: 'essential', location: 'Consumpt-Zone' },
    { name: 'Uniform-Patch', cost: 50, sanityBoost: 20, type: 'essential', icon: 'clothes', benefit: 'Social Standing +5%', location: 'Consumpt-Zone' },
    { name: 'Concert Ticket', cost: 100, sanityBoost: 30, type: 'essential', location: 'Consumpt-Zone' },
    { 
        name: 'Thermal-Regulator', 
        cost: 400, 
        sanityBoost: 10, 
        type: 'asset', 
        icon: 'fridge', 
        benefit: 'Bio-Deficit Rate -50%', 
        location: 'Consumpt-Zone',
        maintenanceCost: 25 
    },
    { 
        name: 'Hypno-Screen', 
        cost: 600, 
        sanityBoost: 40, 
        type: 'asset', 
        icon: 'television', 
        benefit: 'Sanity Bonus +10%', 
        location: 'Consumpt-Zone',
        maintenanceCost: 50 
    },
    {
        name: 'Computer',
        cost: 800,
        sanityBoost: 25,
        type: 'asset',
        icon: 'computer',
        benefit: 'Study Speed +15%',
        location: 'Consumpt-Zone',
        maintenanceCost: 75
    },
    {
        name: 'Filtered-Respirator',
        cost: 150,
        sanityBoost: 0,
        type: 'asset',
        icon: 'masks',
        benefit: 'Scrap Metal Risk -50%',
        location: 'Consumpt-Zone',
        maintenanceCost: 10
    },
    {
        name: 'Blood-Scrubber',
        cost: 250,
        sanityBoost: 0,
        type: 'asset',
        icon: 'healing',
        benefit: 'Plasma Donate Sanity Cost -5',
        location: 'Ripperdoc Clinic',
        maintenanceCost: 20
    },
    {
        name: 'Burner-Comm',
        cost: 350,
        sanityBoost: 0,
        type: 'asset',
        icon: 'phone_android',
        benefit: 'Hustle Heat Generation -50%',
        location: 'Consumpt-Zone',
        maintenanceCost: 30
    },
    { name: 'Vacation Package', cost: 500, sanityBoost: 50, type: 'essential', location: 'Consumpt-Zone' },
    { name: 'Bio-Block-01', cost: 10, sanityBoost: -2, type: 'essential', hungerReduction: 40, location: 'Sustenance Hub' },
    { name: 'Synth-Salad', cost: 12, sanityBoost: 0, type: 'essential', hungerReduction: 30, location: 'Sustenance Hub' },
    { name: 'Real-Meat Burger', cost: 40, sanityBoost: 10, type: 'essential', hungerReduction: 50, location: 'Sustenance Hub' },
    { 
        name: 'Neural Co-Processor', 
        cost: 1000, 
        sanityBoost: 0, 
        type: 'asset', 
        location: 'Ripperdoc Clinic', 
        icon: 'cyberChip', 
        benefit: 'Study Yield +25%', 
        cyberwareEffect: [{ type: 'STUDY_EFFICIENCY', value: 1.25 }],
        maintenanceCost: 100 
    },
    { 
        name: 'Synthetic Liver', 
        cost: 600, 
        sanityBoost: 0, 
        type: 'asset', 
        location: 'Ripperdoc Clinic', 
        icon: 'bioMetrics', 
        benefit: 'Metabolic Stability', 
        cyberwareEffect: [{ type: 'SANITY_TICK', value: 0.1 }],
        maintenanceCost: 50 
    },
    { 
        name: 'Adrenaline Pump', 
        cost: 850, 
        sanityBoost: 0, 
        type: 'asset', 
        location: 'Ripperdoc Clinic', 
        icon: 'bolt', 
        benefit: 'Work Yield +15%', 
        cyberwareEffect: [{ type: 'WORK_EFFICIENCY', value: 1.15 }],
        maintenanceCost: 75 
    }
];
