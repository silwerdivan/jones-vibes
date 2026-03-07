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
                requirement: { type: 'CAR' },
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
        prerequisites: { location: 'Labor Sector' }, 
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
        prerequisites: { location: 'Cred-Debt Ctr' },
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
    },
    {
        id: 'plasma-infection',
        type: 'Hidden',
        title: 'Bio-Sync Infection',
        flavorText: 'The "sterile" clinic was anything but. Your arm is throbbing with a dull, synthetic heat.',
        choices: [
            {
                text: 'Suffer: "I hope my insurance covers this... oh wait."',
                effects: [
                    { type: 'SANITY', value: -10 },
                    { type: 'CONDITION', value: 2.0, conditionId: 'FEVER' }
                ]
            }
        ]
    },
    {
        id: 'scrap-cut',
        type: 'Hidden',
        title: 'Tetanus-Grade Laceration',
        flavorText: 'A jagged piece of rebar caught your leg. It’s bleeding more than you’d like.',
        choices: [
            {
                text: 'Patch it up: "Just another scar for the collection."',
                effects: [
                    { type: 'SANITY', value: -5 },
                    { type: 'TIME', value: -2 }
                ]
            }
        ]
    },
    {
        id: 'global_maglev_panic',
        type: 'Global',
        title: 'Panic Attack on the Mag-Lev',
        flavorText: `The flickering neon and the press of too many synthetic-clothed bodies suddenly feel suffocating. The Mag-Lev screeches around a bend.`,
        choices: [
            {
                text: `Control: "Focus on your breathing."`,
                requirement: { type: 'STAT', id: 'SANITY', value: 60 },
                effects: [
                    { type: 'SANITY', value: 10 }
                ]
            },
            {
                text: `Suffer: "Let the darkness in."`,
                effects: [
                    { type: 'SANITY', value: -20 },
                    { type: 'TIME', value: -1 }
                ]
            },
            {
                text: `Medicate: "Drink some Focus-Fluids."`,
                requirement: { type: 'ITEM', id: 'Focus-Fluids' },
                effects: [
                    { type: 'SANITY', value: 15 }
                ]
            }
        ]
    },
    {
        id: 'local_shady_courier',
        type: 'Local',
        title: 'Shady Fixer Courier Job',
        flavorText: `A hooded figure leans out from a dark alcove, offering you a quick ₡300 to deliver a "warm" datashard to the Cred-Debt Ctr.`,
        prerequisites: { location: 'Labor Sector' },
        choices: [
            {
                text: `Accept: "I need the credits."`,
                requirement: { type: 'STAT', id: 'TIME', value: 4 },
                effects: [
                    { type: 'CREDITS', value: 300 },
                    { type: 'TIME', value: -4 },
                    { type: 'SANITY', value: -10 }
                ]
            },
            {
                text: `Decline: "Too risky."`,
                effects: [
                    { type: 'SANITY', value: 5 }
                ]
            }
        ]
    },
    {
        id: 'local_black_market_biosync',
        type: 'Local',
        title: 'Black Market Bio-Sync',
        flavorText: `A back-alley ripperdoc offers an experimental neuro-sync at a "deep discount." It's mostly sanitary. Probably.`,
        prerequisites: { location: 'Ripperdoc Clinic' },
        choices: [
            {
                text: `Sync: "Boost my efficiency." (₡500)`,
                requirement: { type: 'STAT', id: 'CREDITS', value: 500 },
                effects: [
                    { type: 'CREDITS', value: -500 },
                    { type: 'CONDITION', value: 1.0, conditionId: 'BIO_SYNC' }
                ]
            },
            {
                text: `Sell: "I'll sell some neural data instead."`,
                effects: [
                    { type: 'CREDITS', value: 200 },
                    { type: 'SANITY', value: -20 }
                ]
            },
            {
                text: `Decline: "I like my brain the way it is."`,
                effects: [
                    { type: 'SANITY', value: 5 }
                ]
            }
        ]
    },
    {
        id: 'global_speeding_ticket',
        type: 'Global',
        title: 'Retinal Speeding Citation',
        flavorText: `A law-enforcement drone scanned your vehicle's signature while you were bypassing a congested logic-junction. A fine has been auto-deducted from your account.`,
        prerequisites: { hasCar: true },
        choices: [
            {
                text: `Pay: "Efficiency has its price." (₡500)`,
                effects: [
                    { type: 'CREDITS', value: -500 },
                    { type: 'SANITY', value: -10 }
                ]
            }
        ]
    },
    {
        id: 'consequence_car_accident',
        type: 'Consequence',
        title: 'Multi-Vehicle Collision',
        flavorText: `A glitching delivery-bot swerved into your lane. The sound of crunching synth-steel is deafening. Your vehicle is a total loss.`,
        prerequisites: { hasCar: true },
        choices: [
            {
                text: `Repair: "Restore my mobility." (₡2000)`,
                effects: [
                    { type: 'CREDITS', value: -2000 },
                    { type: 'SANITY', value: -30 }
                ]
            },
            {
                text: `Scrap: "I'm lucky to be alive."`,
                effects: [
                    { type: 'SANITY', value: -50 },
                    { type: 'CAR', value: 0 }
                ]
            }
        ]
    }
];
