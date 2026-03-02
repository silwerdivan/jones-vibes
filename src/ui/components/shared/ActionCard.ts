import { Job, Course, Item } from '../../../models/types.js';
import Player from '../../../game/Player.js';

export type ActionCardType = 'jobs' | 'college' | 'shopping';

export interface ActionCardData {
    type: ActionCardType;
    data: Job | Course | Item;
}

export interface ActionCardConfig {
    player: Player | null;
    onClick?: (data: Job | Course | Item, feedbackText: string, feedbackType: string) => void;
}

export interface ActionCardState {
    isLocked: boolean;
    isCompleted: boolean;
    buttonText: string;
    feedbackText: string;
    feedbackType: 'success' | 'error';
}

function getJobState(job: Job, player: Player | null): ActionCardState {
    const isLocked = !!(player && player.educationLevel < job.educationRequired);
    const isHired = !!(player && player.careerLevel === job.level);
    const isBetterJob = !!(player && player.careerLevel > job.level);
    
    let buttonText = isHired ? 'Hired' : (isBetterJob ? 'Lower Level' : 'Apply');
    const finalIsLocked = isLocked || isBetterJob;
    
    return {
        isLocked: finalIsLocked,
        isCompleted: isHired,
        buttonText,
        feedbackText: 'HIRED!',
        feedbackType: 'success'
    };
}

function getCourseState(course: Course, player: Player | null): ActionCardState {
    const isLocked = !!(player && player.educationLevel < (course.educationMilestone - 1));
    const alreadyTaken = !!(player && player.educationLevel >= course.educationMilestone);
    
    return {
        isLocked: isLocked || alreadyTaken,
        isCompleted: alreadyTaken,
        buttonText: alreadyTaken ? 'Completed' : 'Study',
        feedbackText: `-[OC]${course.cost}`,
        feedbackType: 'error'
    };
}

function getShoppingState(item: Item, player: Player | null): ActionCardState {
    const isLocked = !!(player && player.cash < item.cost);
    
    return {
        isLocked,
        isCompleted: false,
        buttonText: 'Buy',
        feedbackText: `-[OC]${item.cost}`,
        feedbackType: 'error'
    };
}

function createMetaTags(type: ActionCardType, data: Job | Course | Item, state: ActionCardState, player: Player | null): string {
    if (type === 'jobs') {
        const job = data as Job;
        const multiplier = player ? player.wageMultiplier : 1.0;
        const adjustedWage = Math.round(job.wage * multiplier);
        const wageHtml = multiplier < 1.0 
            ? `<span class="wage-original">[OC]${job.wage}</span> <span class="wage-reduced">[OC]${adjustedWage}</span>/CH`
            : `[OC]${job.wage}/CH`;

        return `
            <span class="action-card-tag price"><i class="material-icons">payments</i>${wageHtml}</span>
            <span class="action-card-tag"><i class="material-icons">schedule</i>${job.shiftHours}CH</span>
            <span class="action-card-tag requirement ${state.isLocked ? 'locked' : ''}">
                <i class="material-icons">${state.isLocked ? 'lock' : 'school'}</i>Compliance Level ${job.educationRequired}
            </span>
        `;
    } else if (type === 'college') {
        const course = data as Course;
        return `
            <span class="action-card-tag price ${state.isLocked && !state.isCompleted ? 'locked' : ''}"><i class="material-icons">payments</i>[OC]${course.cost}</span>
            <span class="action-card-tag"><i class="material-icons">history</i>${course.time}CH total</span>
        `;
    } else {
        const item = data as Item;
        let boostHtml = `<span class="action-card-tag"><i class="material-icons">sentiment_very_satisfied</i>+${item.happinessBoost} Morale</span>`;
        if (item.hungerReduction) {
            boostHtml += `<span class="action-card-tag"><i class="material-icons">restaurant</i>-${item.hungerReduction} Bio-Deficit</span>`;
        }
        return `
            <span class="action-card-tag price ${state.isLocked ? 'locked' : ''}"><i class="material-icons">payments</i>[OC]${item.cost}</span>
            ${boostHtml}
        `;
    }
}

export function createActionCard(
    type: ActionCardType,
    data: Job | Course | Item,
    config: ActionCardConfig
): HTMLElement {
    const card = document.createElement('div');
    card.className = 'action-card';
    
    let state: ActionCardState;
    let title = '';
    
    if (type === 'jobs') {
        const job = data as Job;
        title = job.title;
        state = getJobState(job, config.player);
    } else if (type === 'college') {
        const course = data as Course;
        title = course.name;
        state = getCourseState(course, config.player);
    } else {
        const item = data as Item;
        title = item.name;
        state = getShoppingState(item, config.player);
    }
    
    if (state.isLocked) card.classList.add('locked');
    if (state.isCompleted) card.classList.add('hired');
    
    const metaHtml = createMetaTags(type, data, state, config.player);
    
    card.innerHTML = `
        <div class="action-card-content">
            <div class="action-card-title">${title}</div>
            <div class="action-card-meta">${metaHtml}</div>
        </div>
        <div class="action-card-action">
            <button class="btn btn-primary action-card-btn" ${state.isLocked || state.isCompleted ? 'disabled' : ''}>
                ${state.buttonText}
            </button>
        </div>
    `;
    
    if (!state.isLocked && !state.isCompleted && config.onClick) {
        card.onclick = () => {
            config.onClick!(data, state.feedbackText, state.feedbackType);
        };
    }
    
    return card;
}

export function createActionCardList(
    type: ActionCardType,
    items: (Job | Course | Item)[],
    config: ActionCardConfig
): HTMLElement {
    const list = document.createElement('div');
    list.className = 'action-card-list';
    
    items.forEach(item => {
        const card = createActionCard(type, item, config);
        list.appendChild(card);
    });
    
    return list;
}

export default {
    createActionCard,
    createActionCardList
};
