export interface Job {
    level: number;
    title: string;
    wage: number;
    shiftHours: number;
    educationRequired: number;
}

export interface Course {
    id: number;
    name: string;
    cost: number;
    time: number;
    educationMilestone: number;
}

export interface Item {
    name: string;
    cost: number;
    happinessBoost: number;
    type: 'essential' | 'asset';
    location: string;
    icon?: string;
    benefit?: string;
    hungerReduction?: number;
}

export interface Clerk {
    name: string;
    message: string;
    icon: string;
}

export interface PlayerState {
    id: any;
    cash: number;
    savings: number;
    happiness: number;
    educationLevel: number;
    careerLevel: number;
    time: number;
    location: string;
    hasCar: boolean;
    loan: number;
    inventory: Item[];
    hunger: number;
    timeDeficit: number;
    weeklyIncome: number;
    weeklyExpenses: number;
    weeklyHappinessChange: number;
}
