import { GameCondition } from '../models/types';

export const CONDITIONS: Record<string, GameCondition> = {
    'SORE_LEGS': {
        id: 'SORE_LEGS',
        name: 'Sore Legs',
        description: 'Walking is painful. Travel time increased by 50%.',
        remainingDuration: 168, // 7 days * 24 hours
        effects: [
            { type: 'TRAVEL_TIME_MODIFIER', value: 1.5 }
        ],
        icon: '🦵'
    },
    'AD_FATIGUE': {
        id: 'AD_FATIGUE',
        name: 'Ad Fatigue',
        description: 'Retinal ads are everywhere. Constant drain on sanity.',
        remainingDuration: 72, // 3 days
        effects: [
            { type: 'SANITY_TICK', value: -0.2 } // -0.2 per hour = -4.8 per day
        ],
        icon: '👁️'
    },
    'FOOD_POISONING': {
        id: 'FOOD_POISONING',
        name: 'Food Poisoning',
        description: 'Your stomach is in knots. Work efficiency reduced.',
        remainingDuration: 72,
        effects: [
            { type: 'WORK_EFFICIENCY', value: 0.9 },
            { type: 'WAGE_MULTIPLIER', value: 0.9 }
        ],
        icon: '🤢'
    },
    'FAVOR_WITH_BOSS': {
        id: 'FAVOR_WITH_BOSS',
        name: 'Favor with the Boss',
        description: 'Management is impressed. +20% Wage bonus.',
        remainingDuration: 168,
        effects: [
            { type: 'WAGE_MULTIPLIER', value: 1.2 }
        ],
        icon: '🤝'
    },
    'PARANOIA': {
        id: 'PARANOIA',
        name: 'Paranoia',
        description: 'You feel like you are being watched.',
        remainingDuration: 120, // 5 days
        effects: [
            { type: 'SANITY_TICK', value: -0.2 }
        ],
        icon: '😰'
    },
    'BRAIN_FOG': {
        id: 'BRAIN_FOG',
        name: 'Brain Fog',
        description: 'Your mind is hazy. Study speed and wages reduced.',
        remainingDuration: 120,
        effects: [
            { type: 'STUDY_EFFICIENCY', value: 0.5 },
            { type: 'WAGE_MULTIPLIER', value: 0.8 }
        ],
        icon: '😶‍🌫️'
    },
    'HYPER_FOCUS': {
        id: 'HYPER_FOCUS',
        name: 'Hyper-Focus',
        description: 'In the zone. +50% Study Speed.',
        remainingDuration: 24,
        effects: [
            { type: 'STUDY_EFFICIENCY', value: 1.5 }
        ],
        icon: '🧠'
    },
    'TRAUMA_REBOOT': {
        id: 'TRAUMA_REBOOT',
        name: 'Trauma Reboot',
        description: 'Severe mental collapse. Max Energy reduced by 20% during recovery.',
        remainingDuration: 336, // 14 days * 24 hours
        effects: [
            { type: 'MAX_ENERGY', value: 0.8 }
        ],
        icon: '🧠'
    }
};
