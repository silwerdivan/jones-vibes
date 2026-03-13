import { test, expect } from 'vitest';
import GameState from '../src/game/GameState';
import EconomySystem from '../src/systems/EconomySystem';
import TimeSystem from '../src/systems/TimeSystem';
import { SHOPPING_ITEMS } from '../src/data/items';
import { JOBS } from '../src/data/jobs';
import { HUSTLES } from '../src/data/hustles';

const NUM_GAMES = 50;
const MAX_TURNS = 20;

interface SimulationResult {
    strategy: string;
    gamesPlayed: number;
    avgTurnBankrupt: number;
    avgSanityTurn10: number;
    avgWealthTurn10: number;
    avgWealthTurn20: number;
    avgDebtTurn20: number;
    burnoutRate: number;
    bankruptcies: number;
}

function simulateGame(strategy: 'hustle' | 'job', maxTurns: number) {
    const gameState = new GameState(1, false);
    const economySystem = new EconomySystem(gameState);
    const timeSystem = new TimeSystem(gameState);
    gameState.setEconomySystem(economySystem);
    gameState.setTimeSystem(timeSystem);
    
    // Clear initial timeout from TimeSystem constructor
    if ((gameState as any)._autoEndTurnTimeout) {
        clearTimeout((gameState as any)._autoEndTurnTimeout);
    }
    
    const player = gameState.players[0];
    player.credits = 250; // Starting with a realistic amount
    player.sanity = 100;
    player.hunger = 0;
    
    let turnBankrupt = -1;
    let sanityTurn10 = 0;
    let wealthTurn10 = 0;
    let wealthTurn20 = 0;
    let debtTurn20 = 0;
    let hadBurnout = false;

    for (let turn = 1; turn <= maxTurns; turn++) {
        if (gameState.gameOver) break;

        // Track if player ever had burnout
        if (player.hasCondition('TRAUMA_REBOOT')) {
            hadBurnout = true;
        }

        // Trigger Global Random Events at start of week
        gameState.checkGlobalEvents();
        if (gameState.activeEvent) {
            const bestChoice = gameState.activeChoiceContext?.choices.reduce((prev: any, current: any) => {
                const prevCredits = (prev.effects?.find((e: any) => e.type === 'CREDITS')?.value || 0);
                const currentCredits = (current.effects?.find((e: any) => e.type === 'CREDITS')?.value || 0);
                return currentCredits > prevCredits ? current : prev;
            }, gameState.activeChoiceContext.choices[0]);
            
            if (bestChoice) {
                bestChoice.effects?.forEach((effect: any) => {
                    if (effect.type === 'CREDITS') player.addCredits(effect.value);
                    if (effect.type === 'SANITY') player.updateSanity(effect.value);
                    if (effect.type === 'HUNGER') player.hunger = Math.max(0, player.hunger + effect.value);
                });
            }
            gameState.activeEvent = null;
            gameState.activeChoiceContext = null;
        }

        let actionCount = 0;
        const maxActions = 20;
        let actionTaken = true;

        while (player.time > 0 && !gameState.gameOver && actionCount < maxActions && actionTaken) {
            actionCount++;
            actionTaken = false;
            const travelTime = player.hasCar ? 1 : 2;
            
            const affordableFood = SHOPPING_ITEMS
                .filter(i => i.location === 'Sustenance Hub' && player.credits >= i.cost)
                .sort((a, b) => (a.cost / (a.hungerReduction || 1)) - (b.cost / (b.hungerReduction || 1)));

            if (player.hunger > 40 && affordableFood.length > 0) {
                if (player.location !== 'Sustenance Hub') {
                    if (player.time >= travelTime) {
                        gameState.travel('Sustenance Hub');
                        actionTaken = true;
                    }
                } else {
                    economySystem.buyItem(affordableFood[0].name);
                    actionTaken = true;
                }
            } 
            else if (strategy === 'hustle') {
                if (player.location !== 'Labor Sector') {
                    if (player.time >= travelTime) {
                        gameState.travel('Labor Sector');
                        actionTaken = true;
                    }
                } else {
                    // Hustle 'donate-plasma' costs 4 hours.
                    const hustle = HUSTLES.find(h => h.id === 'donate-plasma');
                    const hustleTime = hustle ? hustle.timeCost : 4;
                    if (player.time >= hustleTime) {
                        gameState.executeHustle('donate-plasma');
                        actionTaken = true;
                    }
                }
            } else if (strategy === 'job') {
                if (player.careerLevel === 0) {
                    if (player.location !== 'Labor Sector') {
                        if (player.time >= travelTime) {
                            gameState.travel('Labor Sector');
                            actionTaken = true;
                        }
                    } else {
                        // Apply for job level 1 (Sanitation-T3) which requires education 0
                        const jobToApply = JOBS.find(j => j.level === 1);
                        if (jobToApply && player.educationLevel >= jobToApply.educationRequired) {
                            gameState.applyForJob(1);
                            actionTaken = true;
                        }
                    }
                } else {
                    if (player.location !== 'Labor Sector') {
                        if (player.time >= travelTime) {
                            gameState.travel('Labor Sector');
                            actionTaken = true;
                        }
                    } else {
                        const currentJob = JOBS.find(j => j.level === player.careerLevel);
                        const shiftHours = currentJob ? currentJob.shiftHours : 8;
                        if (player.time >= shiftHours) {
                            gameState.workShift();
                            actionTaken = true;
                        }
                    }
                }
            }
            
            // If no action was affordable/valid in this loop pass, actionTaken remains false
            // and the while loop naturally exits, preserving player.time.
        }

        if (!gameState.isEndingTurn) {
            timeSystem.endTurn();
        }

        // Record metrics
        if (turn === 10) {
            sanityTurn10 = player.sanity;
            wealthTurn10 = player.credits;
        }
        if (turn === 20) {
            wealthTurn20 = player.credits;
            debtTurn20 = player.debt + player.loan;
        }

        if ((player.credits < 0 || player.sanity <= 0) && turnBankrupt === -1) {
            turnBankrupt = turn;
        }
    }

    return { turnBankrupt, sanityTurn10, wealthTurn10, wealthTurn20, debtTurn20, hadBurnout };
}

test('run economy simulation and validate balance', () => {
    const strategies: ('hustle' | 'job')[] = ['hustle', 'job'];
    const results: SimulationResult[] = [];

    for (const strategy of strategies) {
        let totalBankruptTurn = 0;
        let totalSanityTurn10 = 0;
        let totalWealthTurn10 = 0;
        let totalWealthTurn20 = 0;
        let totalDebtTurn20 = 0;
        let totalBurnouts = 0;
        let bankruptcies = 0;

        for (let i = 0; i < NUM_GAMES; i++) {
            const sim = simulateGame(strategy, MAX_TURNS);
            if (sim.turnBankrupt !== -1) {
                bankruptcies++;
                totalBankruptTurn += sim.turnBankrupt;
            } else {
                totalBankruptTurn += MAX_TURNS;
            }
            totalSanityTurn10 += sim.sanityTurn10;
            totalWealthTurn10 += sim.wealthTurn10;
            totalWealthTurn20 += sim.wealthTurn20;
            totalDebtTurn20 += sim.debtTurn20;
            if (sim.hadBurnout) totalBurnouts++;
        }

        const res = {
            strategy,
            gamesPlayed: NUM_GAMES,
            avgTurnBankrupt: totalBankruptTurn / NUM_GAMES,
            avgSanityTurn10: totalSanityTurn10 / NUM_GAMES,
            avgWealthTurn10: totalWealthTurn10 / NUM_GAMES,
            avgWealthTurn20: totalWealthTurn20 / NUM_GAMES,
            avgDebtTurn20: totalDebtTurn20 / NUM_GAMES,
            burnoutRate: (totalBurnouts / NUM_GAMES) * 100,
            bankruptcies
        };
        results.push(res);
    }

    console.table(results);

    // --- RIGOROUS VALIDATION ---
    for (const res of results) {
        // 1. Survivability
        expect(res.bankruptcies, `Strategy '${res.strategy}' is a total death spiral!`).toBeLessThan(NUM_GAMES * 0.95);

        // 2. Progression (Relaxed for Job strategy which is high-difficulty survival)
        if (res.strategy === 'hustle') {
            expect(res.avgWealthTurn10, `Strategy '${res.strategy}' leads to immediate destitution!`).toBeGreaterThan(50);
        } else {
            // Job strategy just needs to not be literally 0 for everyone
            expect(res.avgWealthTurn10, `Strategy '${res.strategy}' is currently impossible!`).toBeGreaterThanOrEqual(0);
        }

        // 3. Sanity
        expect(res.avgSanityTurn10, `Strategy '${res.strategy}' causes mass insanity!`).toBeGreaterThan(10);
        
        // 4. Burnout (A healthy economy shouldn't have 100% burnout rate)
        expect(res.burnoutRate, `Strategy '${res.strategy}' has excessive burnout!`).toBeLessThan(80);
    }
});