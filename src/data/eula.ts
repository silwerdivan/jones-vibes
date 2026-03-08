export interface IntroCallout {
    label: string;
    text: string;
}

export const GAME_INTRO_BODY = `
Jones in the Fastlane is a pressure-management game about clawing your way out of survival mode. Every cycle you move through the city, spend limited hours, protect your sanity, and decide whether to chase stability, gamble on hustles, or invest in the long climb upward.

Burn Rate is the weekly bill you must cover just to stay operational. Debt grows when you miss it. Ambient Stress is the background sanity drain that hits every cycle before your rest recovery. The run gets tighter if you ignore those systems or spend all your time reacting.

The run opens up when you land better work, build education, and turn desperate short-term choices into sustainable momentum. The point is to survive the squeeze long enough to become dangerous.
`;

export const GAME_INTRO_CALLOUTS: IntroCallout[] = [
    {
        label: 'CORE LOOP',
        text: 'Travel, choose actions, manage credits and sanity, then close the cycle before pressure compounds.'
    },
    {
        label: 'EARLY GAME',
        text: 'You start constrained. Stable labor keeps you alive, hustles cover emergencies, and bad tradeoffs can trap you.'
    },
    {
        label: 'WIN FANTASY',
        text: 'Convert scarcity into leverage. Better jobs, education, and discipline let you control the board instead of reacting to it.'
    }
];
