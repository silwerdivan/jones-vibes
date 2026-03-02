import Player from '../game/Player';

export interface EulaClause {
    id: string;
    title: string;
    description: string;
    benefit: string;
    penalty: string;
    apply: (player: Player) => void;
}

export const EULA_TEXT = `
OMNILIFE OS v4.2.0 - USER END-POINT LICENSE AGREEMENT (EULA)

1. PROVISION OF EXISTENCE
By clicking "I ACCEPT", the User (hereafter "Biological Asset") acknowledges that their continued existence within the OmniCity simulation is a privilege, not a right, provided by OmniCorp (hereafter "The Provider"). 

2. DATA HARVESTING & BIOMETRIC MONITORING
The Biological Asset grants The Provider irrevocable, global, royalty-free access to all metabolic, financial, and cognitive data generated during the term of existence. This includes, but is not limited to: heart rate during labor, purchasing patterns of "Essential" goods, and any subversive thoughts regarding corporate "optimization".

3. OPTIONAL PRODUCTIVITY ENHANCEMENTS (CLAUSES)
Biological Assets may opt-in to specific productivity protocols to accelerate their contribution to OmniCorp's quarterly earnings. These protocols carry inherent biological and financial risks which the Biological Asset assumes in full.

4. TERMINATION OF SERVICE
The Provider reserves the right to terminate the Biological Asset's "Life Session" if productivity falls below acceptable margins, or if the Biological Asset's "Morale" (Happiness) drops to a level that threatens the stability of the simulation's socio-economic fabric.

5. LIMITATION OF LIABILITY
OmniCorp is not responsible for any "Turn 1 Deaths", existential dread, or loss of digital or physical assets resulting from the use of OmniLife OS. 

BY PROCEEDING, YOU AGREE TO BE BOUND BY THE TERMS OF THIS AGREEMENT. SCROLL TO THE BOTTOM TO ACKNOWLEDGE YOUR COMPLIANCE.
`;

export const EULA_CLAUSES: EulaClause[] = [
    {
        id: 'A',
        title: 'Micro-Stimulus Protocol',
        description: 'Receive an upfront metabolic stimulus to jumpstart your contribution.',
        benefit: '+$200 Starting Capital',
        penalty: '+40 Bio-Deficit (Hunger)',
        apply: (player: Player) => {
            player.addCash(200);
            player.hunger += 40;
        }
    },
    {
        id: 'B',
        title: 'Hyper-Grindset Agreement',
        description: 'Waive your right to a standard 24-hour cycle for the initial orientation.',
        benefit: 'Orientation Overtime',
        penalty: '+6 Hours (Turn 1 only), -20 Morale (Happiness)',
        apply: (player: Player) => {
            player.time += 6;
            player.updateHappiness(-20);
        }
    },
    {
        id: 'C',
        title: 'Data-Harvest Consent',
        description: 'Your data will be harvested for "optimization" in exchange for hardware.',
        benefit: 'Omni-Terminal Interface',
        penalty: '-10% Wage Multiplier (Global)',
        apply: (player: Player) => {
            player.inventory.push({
                name: 'Omni-Terminal',
                cost: 0,
                happinessBoost: 0,
                type: 'essential',
                location: 'Anywhere',
                benefit: 'Direct access to OmniNet'
            });
            player.wageMultiplier = 0.9;
        }
    },
    {
        id: 'D',
        title: 'Liquidity Injection',
        description: 'Instant credit line for assets who value momentum over solvency.',
        benefit: '+$500 Starting Capital',
        penalty: '+$500 Bank Debt',
        apply: (player: Player) => {
            player.addCash(500);
            player.takeLoan(500);
        }
    }
];
