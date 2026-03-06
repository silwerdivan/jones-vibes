import Player from './Player';
import GameState from './GameState';
import { RandomEvent, RandomEventEffect } from '../models/types';
import EventBus, { UI_EVENTS } from '../EventBus.js';
import { CONDITIONS } from '../data/conditions';
import { RANDOM_EVENTS } from '../data/randomEvents';

export class EventManager {
    private events: RandomEvent[] = [];
    private eventHistory: string[] = [];

    constructor(eventHistory: string[] = []) {
        this.events = RANDOM_EVENTS;
        this.eventHistory = eventHistory;
    }

    getHistory(): string[] {
        return [...this.eventHistory];
    }

    checkTriggers(triggerType: 'Global' | 'Local' | 'Consequence', gameState: GameState, context: any = {}): void {
        const currentPlayer = gameState.getCurrentPlayer();
        
        // Don't trigger events for AI players for now to avoid UI conflicts, 
        // unless we implement AI choice logic
        if (currentPlayer.isAI) return;

        const availableEvents = this.events.filter(event => {
            if (event.type !== triggerType) return false;
            
            // Check cooldown: not in last 3 events (shortened from 5 for testing with small deck)
            if (this.eventHistory.slice(-3).includes(event.id)) return false;

            return this.evaluatePrerequisites(event, currentPlayer, gameState, context);
        });

        if (availableEvents.length > 0) {
            // Chance check: Global 100% (since it's start of week), Local 30%, Consequence 50%
            let chance = 1.0;
            if (triggerType === 'Local') chance = 0.3;
            if (triggerType === 'Consequence') chance = 0.5;

            if (Math.random() <= chance) {
                const event = availableEvents[Math.floor(Math.random() * availableEvents.length)];
                this.triggerEvent(event, gameState);
            }
        }
    }

    private evaluatePrerequisites(event: RandomEvent, player: Player, _gameState: GameState, _context: any): boolean {
        if (!event.prerequisites) return true;

        const { location, minSanity, maxSanity, minWealth, maxWealth, careerLevel, itemRequired } = event.prerequisites;

        if (location && player.location !== location) return false;
        if (minSanity !== undefined && player.sanity < minSanity) return false;
        if (maxSanity !== undefined && player.sanity > maxSanity) return false;
        
        const totalWealth = player.credits + player.savings;
        if (minWealth !== undefined && totalWealth < minWealth) return false;
        if (maxWealth !== undefined && totalWealth > maxWealth) return false;
        
        if (careerLevel !== undefined && player.careerLevel < careerLevel) return false;
        if (itemRequired && !player.inventory.some(item => item.name === itemRequired)) return false;

        return true;
    }

    private triggerEvent(event: RandomEvent, gameState: GameState): void {
        this.eventHistory.push(event.id);
        
        // Filter choices by requirements
        const player = gameState.getCurrentPlayer();
        const validChoices = event.choices.filter(choice => {
            if (!choice.requirement) return true;
            const req = choice.requirement;
            switch (req.type) {
                case 'ITEM':
                    return player.inventory.some(item => item.name === req.id);
                case 'CAREER':
                    return player.careerLevel >= (req.value || 0);
                case 'EDUCATION':
                    return player.educationLevel >= (req.value || 0);
                case 'STAT':
                    // Not implemented yet, could be sanity, etc.
                    return true;
                default:
                    return true;
            }
        });

        // Use a specialized event for random events
        EventBus.publish('randomEventTriggered', {
            event: {
                ...event,
                choices: validChoices
            },
            callback: (choiceIndex: number) => {
                const actualChoice = validChoices[choiceIndex];
                // Find index of this choice in the original event.choices
                const originalIndex = event.choices.indexOf(actualChoice);
                this.applyChoice(event, originalIndex, gameState);
            }
        });
    }

    applyChoice(event: RandomEvent, choiceIndex: number, gameState: GameState): void {
        const player = gameState.getCurrentPlayer();
        const choice = event.choices[choiceIndex];

        choice.effects.forEach(effect => {
            this.applyEffect(effect, player, gameState);
        });

        // Special handling for some events
        if (event.id === 'local_fastfood_glitch' && choiceIndex === 0) {
            // Risk it: 50% chance for food poisoning
            if (Math.random() < 0.5) {
                const condition = CONDITIONS['FOOD_POISONING'];
                player.addCondition({ ...condition });
                gameState.addLogMessage('The synthetic burger was... questionable. You feel ill.', 'warning');
            }
        }
        
        if (event.id === 'state_high_sanity_flow' && choiceIndex === 1) {
            // Market: multiply by credits
            const bonus = player.educationCredits * 3;
            player.addCredits(bonus);
            gameState.addLogMessage(`Market insight yielded ₡${bonus}.`, 'success');
        }

        gameState.activeEvent = null; // Clear the active event
        gameState.addLogMessage(`Event: ${event.title} - choice recorded.`, 'info');
        gameState.publishCurrentState();
    }

    private applyEffect(effect: RandomEventEffect, player: Player, _gameState: GameState): void {
        switch (effect.type) {
            case 'CREDITS':
                if (effect.value < 0) player.spendCredits(-effect.value);
                else player.addCredits(effect.value);
                break;
            case 'SANITY':
                player.updateSanity(effect.value);
                break;
            case 'HUNGER':
                player.hunger += effect.value;
                if (player.hunger < 0) player.hunger = 0;
                if (player.hunger > 100) player.hunger = 100;
                break;
            case 'TIME':
                player.time += effect.value;
                break;
            case 'CONDITION':
                if (effect.conditionId) {
                    const condition = CONDITIONS[effect.conditionId];
                    if (condition) {
                        player.addCondition({ ...condition });
                    }
                }
                break;
            case 'EDUCATION_CREDITS':
                player.addEducationCredits(effect.value);
                break;
        }
    }

    tickConditions(player: Player, hours: number): void {
        const initialCount = player.activeConditions.length;
        
        // Apply TICK effects (like sanity drain)
        player.activeConditions.forEach(condition => {
            condition.effects.forEach(effect => {
                if (effect.type === 'SANITY_TICK') {
                    player.updateSanity(effect.value * hours);
                }
            });
        });

        player.tickConditions(hours);
        
        if (player.activeConditions.length < initialCount) {
            // Some conditions expired
            EventBus.publish(UI_EVENTS.REQUEST_STATE_REFRESH);
        }
    }
}
