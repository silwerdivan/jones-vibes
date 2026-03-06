import { RandomEvent } from '../models/types';

export const RANDOM_EVENTS: RandomEvent[] = [
    {
        id: 'global_transit_strike',
        type: 'Global',
        title: 'Transit Strike',
        flavorText: `The Mag-Lev transit workers are striking for better cybernetic health plans. The city's gridlock is absolute.`,
        choices: [
            {
                text: `Suffer: "Guess I'm walking."`,
                effects: [
                    { type: 'CONDITION', value: 1.0, conditionId: 'SORE_LEGS' }
                ]
            },
            {
                text: `Bribe: "Pay a private aerocab." (₡150)`,
                effects: [
                    { type: 'CREDITS', value: -150 }
                ]
            },
            {
                text: `Car: "Good thing I own a ride."`,
                requirement: { type: 'ITEM', id: 'Car' },
                effects: [
                    { type: 'SANITY', value: 10 }
                ]
            }
        ]
    },
    {
        id: 'global_stimulus_windfall',
        type: 'Global',
        title: 'Network Stimulus Drop',
        flavorText: `The city network is distributing digital stimulus tokens to low-tier citizens... provided you agree to 24/7 retinal ad-tracking.`,
        prerequisites: { maxWealth: 500 },
        choices: [
            {
                text: `Accept: "I need the credits."`,
                effects: [
                    { type: 'CREDITS', value: 300 },
                    { type: 'CONDITION', value: 1.0, conditionId: 'AD_FATIGUE' }
                ]
            },
            {
                text: `Reject: "Keep your spyware."`,
                effects: [
                    { type: 'SANITY', value: 10 }
                ]
            },
            {
                text: `Hack: "Scrub the tracking code."`,
                requirement: { type: 'ITEM', id: 'Computer' },
                effects: [
                    { type: 'TIME', value: -4 },
                    { type: 'CREDITS', value: 300 }
                ]
            }
        ]
    },
    {
        id: 'local_fastfood_glitch',
        type: 'Local',
        title: 'Broken Auto-Chef',
        flavorText: `The synthetic burger dispenser is sparking, spitting out double portions but smelling faintly of ozone.`,
        prerequisites: { location: 'Slums' }, 
        choices: [
            {
                text: `Risk it: "Free calories!"`,
                effects: [
                    { type: 'HUNGER', value: -100 }
                ]
            },
            {
                text: `Safe: "Buy a sealed protein bar." (₡20)`,
                effects: [
                    { type: 'CREDITS', value: -20 },
                    { type: 'HUNGER', value: -25 }
                ]
            },
            {
                text: `Fix it: "Recalibrate the dispenser."`,
                requirement: { type: 'CAREER', value: 2 },
                effects: [
                    { type: 'HUNGER', value: -100 },
                    { type: 'SANITY', value: 5 }
                ]
            }
        ]
    },
    {
        id: 'local_college_blackmarket',
        type: 'Local',
        title: 'Stolen Datashard',
        flavorText: `A jittery student pulls you aside in the hallway, offering a shard containing all the answers for your next three modules.`,
        prerequisites: { location: 'Cognitive Re-Ed' },
        choices: [
            {
                text: `Buy: "Knowledge is power, but time is money." (₡250)`,
                effects: [
                    { type: 'CREDITS', value: -250 },
                    { type: 'EDUCATION_CREDITS', value: 30 }
                ]
            },
            {
                text: `Report: "I do my own work."`,
                effects: [
                    { type: 'SANITY', value: 15 },
                    { type: 'CREDITS', value: 50 }
                ]
            },
            {
                text: `Ignore: "Not my problem."`,
                effects: [
                    { type: 'TIME', value: -1 }
                ]
            }
        ]
    },
    {
        id: 'local_bank_glitch',
        type: 'Local',
        title: 'Glitching ATM',
        flavorText: `As you walk past the terminal, it spits out a stack of untraceable cred-chips. The camera above it is currently rebooting.`,
        prerequisites: { location: 'Credit Union' },
        choices: [
            {
                text: `Take: "Finders keepers."`,
                effects: [
                    { type: 'CREDITS', value: 400 },
                    { type: 'CONDITION', value: 1.0, conditionId: 'PARANOIA' }
                ]
            },
            {
                text: `Report: "The corpos always find out."`,
                effects: [
                    { type: 'SANITY', value: 10 },
                    { type: 'CREDITS', value: 20 }
                ]
            }
        ]
    },
    {
        id: 'state_low_sanity_burnout',
        type: 'Consequence',
        title: 'Crushing Burnout',
        flavorText: `Your alarm goes off, but your body refuses to move. The neon lights outside your window just give you a headache. You are completely burnt out.`,
        prerequisites: { maxSanity: 20 },
        choices: [
            {
                text: `Rest: "I need to rest."`,
                effects: [
                    { type: 'TIME', value: -12 },
                    { type: 'SANITY', value: 40 }
                ]
            },
            {
                text: `Push: "I can't afford to stop."`,
                effects: [
                    { type: 'CONDITION', value: 1.0, conditionId: 'BRAIN_FOG' }
                ]
            }
        ]
    },
    {
        id: 'state_high_sanity_flow',
        type: 'Consequence',
        title: 'Late Night Inspiration',
        flavorText: `You're in the zone. The city is quiet, your mind is sharp, and you feel like you could solve any equation the world throws at you.`,
        prerequisites: { minSanity: 90 },
        choices: [
            {
                text: `Study: "Time to study."`,
                effects: [
                    { type: 'CONDITION', value: 1.0, conditionId: 'HYPER_FOCUS' }
                ]
            },
            {
                text: `Market: "Let's make some investments."`,
                effects: [
                    { type: 'CREDITS', value: 100 }
                ]
            },
            {
                text: `Sleep: "Don't ruin a good day."`,
                effects: [
                    { type: 'SANITY', value: 100 }
                ]
            }
        ]
    }
];
