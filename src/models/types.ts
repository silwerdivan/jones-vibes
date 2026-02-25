import { UI_EVENTS } from '../EventBus.js';

export interface IconRegistry {
    [key: string]: (size?: number, color?: string) => string;
}

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
    id: number;
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
    isAI: boolean;
    name: string;
}

export interface GameStateState {
    players: PlayerState[];
    currentPlayerIndex: number;
    turn: number;
    gameOver: boolean;
    winnerId: number | null;
    log: LogMessage[];
    isPlayer2AI: boolean;
    pendingTurnSummary?: TurnSummary | null;
    activeScreenId: string;
    activeLocationDashboard: string | null;
    activeChoiceContext: ActiveChoiceContext | null;
}

export interface TurnEvent {
    type: string;
    label: string;
    value: number;
    unit: string;
    icon: string;
}

export interface TurnSummary {
    player: number;
    playerName: string;
    week: number;
    events: TurnEvent[];
    totals: {
        cashChange: number;
        happinessChange: number;
    };
}

export interface LogMessage {
    text: string;
    category: string;
    timestamp: string;
}

export interface AIAction {
    action: string;
    params?: any;
}

export interface Choice {
    text: string;
    value?: any;
    actionId?: keyof typeof UI_EVENTS;
    action?: (value?: any, amount?: number) => void;
}

export interface ActiveChoiceContext {
    title: string;
    choices: Choice[];
    showInput?: boolean;
}

export interface LocationAction {
    label: string;
    icon: string;
    primary: boolean;
    className?: string;
    onClick: (e: MouseEvent) => void;
}
