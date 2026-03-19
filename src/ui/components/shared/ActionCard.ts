import { Job, Course, Item, Hustle } from '../../../models/types.js';
import Player from '../../../game/Player.js';

export type ActionCardType = 'jobs' | 'college' | 'shopping' | 'hustles';

export interface ActionCardData {
    type: ActionCardType;
    data: Job | Course | Item | Hustle;
}

export interface ActionCardConfig {
    player: Player | null;
    onClick?: (data: Job | Course | Item | Hustle, feedbackText: string, feedbackType: string) => void;
}

export interface ActionCardState {
    isLocked: boolean;
    isCompleted: boolean;
    buttonText: string;
    feedbackText: string;
    feedbackType: 'success' | 'error';
}

function slugifyActionCardValue(value: string): string {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-');
}

function getActionCardAutomationKey(type: ActionCardType, data: Job | Course | Item | Hustle): string {
    if (type === 'jobs') {
        const job = data as Job;
        return slugifyActionCardValue(`level-${job.level}-${job.title}`);
    }

    if (type === 'college') {
        const course = data as Course;
        return slugifyActionCardValue(`course-${course.id}-${course.name}`);
    }

    if (type === 'hustles') {
        const hustle = data as Hustle;
        return slugifyActionCardValue(`hustle-${hustle.id}`);
    }

    const item = data as Item;
    return slugifyActionCardValue(`${item.location}-${item.name}`);
}

function getJobState(job: Job, player: Player | null): ActionCardState {
    const isLockedByEducation = !!(player && player.educationLevel < job.educationRequired);
    const isLockedByHunger = !!(player && player.hunger > 50 && job.level > 1);
    const isLocked = isLockedByEducation || isLockedByHunger;
    const isHired = !!(player && player.careerLevel === job.level);
    const isBetterJob = !!(player && player.careerLevel > job.level);
    
    let buttonText = isHired ? 'Hired' : (isBetterJob ? 'Lower Level' : 'Apply');
    if (isLockedByHunger) buttonText = 'Focus Lost';

    const finalIsLocked = isLocked || isBetterJob;
    
    return {
        isLocked: finalIsLocked,
        isCompleted: isHired,
        buttonText,
        feedbackText: isLockedByHunger ? 'Too Hungry' : 'HIRED!',
        feedbackType: isLockedByHunger ? 'error' : 'success'
    };
}

function getCourseState(course: Course, player: Player | null): ActionCardState {
    const isLockedByEducation = !!(player && player.educationLevel < (course.educationMilestone - 1));
    const isLockedByHunger = !!(player && player.hunger > 50);
    const isLocked = isLockedByEducation || isLockedByHunger;
    const alreadyTaken = !!(player && player.educationLevel >= course.educationMilestone);
    
    let buttonText = alreadyTaken ? 'Completed' : 'Study';
    if (isLockedByHunger && !alreadyTaken) buttonText = 'Focus Lost';

    return {
        isLocked: isLocked || alreadyTaken,
        isCompleted: alreadyTaken,
        buttonText,
        feedbackText: isLockedByHunger ? 'Too Hungry' : `-₡${course.cost}`,
        feedbackType: 'error'
    };
}

function getShoppingState(item: Item, player: Player | null): ActionCardState {
    const isLocked = !!(player && player.credits < item.cost);
    
    return {
        isLocked,
        isCompleted: false,
        buttonText: 'Buy',
        feedbackText: `-₡${item.cost}`,
        feedbackType: 'error'
    };
}

function getHustleState(hustle: Hustle, player: Player | null): ActionCardState {
    const isLocked = !!(player && (player.time < hustle.timeCost || player.sanity < hustle.sanityCost));
    const currentHeat = player?.hustleHeat?.[hustle.id] || 0;
    const heatPenalty = Math.min(0.5, currentHeat * 0.1);
    const actualReward = Math.round(hustle.reward * (1 - heatPenalty));

    return {
        isLocked,
        isCompleted: false,
        buttonText: 'Hustle',
        feedbackText: `+₡${actualReward}`,
        feedbackType: 'success'
    };
}

function createMetaTags(type: ActionCardType, data: Job | Course | Item | Hustle, state: ActionCardState, player: Player | null): string {
    if (type === 'jobs') {
        const job = data as Job;
        const multiplier = player ? player.wageMultiplier : 1.0;
        const adjustedWage = Math.round(job.wage * multiplier);
        const wageHtml = multiplier < 1.0
            ? `<span class="wage-original">₡${job.wage}</span> <span class="wage-reduced">₡${adjustedWage}</span>/CH`
            : `₡${job.wage}/CH`;

        const isLockedByHunger = !!(player && player.hunger > 50 && job.level > 1);
        const hungerLockHtml = isLockedByHunger 
            ? `<span class="action-card-tag danger"><i class="material-icons">warning</i>Starvation Lockout</span>` 
            : '';

        return `
            <span class="action-card-tag price"><i class="material-icons">payments</i>${wageHtml}</span>
            <span class="action-card-tag"><i class="material-icons">schedule</i>${job.shiftHours}CH</span>
            <span class="action-card-tag requirement ${state.isLocked && !isLockedByHunger ? 'locked' : ''}">
                <i class="material-icons">${state.isLocked && !isLockedByHunger ? 'lock' : 'school'}</i>Compliance Level ${job.educationRequired}
            </span>
            ${hungerLockHtml}
        `;
    } else if (type === 'college') {
        const course = data as Course;
        const isLockedByHunger = !!(player && player.hunger > 50);
        const hungerLockHtml = isLockedByHunger 
            ? `<span class="action-card-tag danger"><i class="material-icons">warning</i>Starvation Lockout</span>` 
            : '';
            
        return `
            <span class="action-card-tag price ${state.isLocked && !state.isCompleted && !isLockedByHunger ? 'locked' : ''}"><i class="material-icons">payments</i>₡${course.cost}</span>
            <span class="action-card-tag"><i class="material-icons">history</i>${course.time}CH total</span>
            ${hungerLockHtml}
        `;
    } else if (type === 'hustles') {
        const hustle = data as Hustle;
        const currentHeat = player?.hustleHeat?.[hustle.id] || 0;
        const heatPenalty = Math.min(0.5, currentHeat * 0.1);
        const actualReward = Math.round(hustle.reward * (1 - heatPenalty));
        const actualRisk = hustle.risk + (currentHeat * 0.05);
        const heatHtml = currentHeat > 0 ? `<span class="action-card-tag penalty"><i class="material-icons">local_fire_department</i>Heat: ${currentHeat}</span>` : '';
        const rewardHtml = heatPenalty > 0 
            ? `<span class="wage-original">₡${hustle.reward}</span> <span class="wage-reduced">₡${actualReward}</span>` 
            : `+₡${hustle.reward}`;

        return `
            <span class="action-card-tag price"><i class="material-icons">payments</i>${rewardHtml}</span>
            <span class="action-card-tag"><i class="material-icons">schedule</i>${hustle.timeCost}CH</span>
            <span class="action-card-tag penalty"><i class="material-icons">psychology</i>-${hustle.sanityCost} Sanity</span>
            ${heatHtml}
            <div class="action-card-flavor">${hustle.flavorText} <br/><span class="action-card-tag warning"><i class="material-icons">warning</i>Risk: ${Math.round(actualRisk * 100)}%</span></div>
        `;
    } else {
        const item = data as Item;
        const sanityLabel = item.sanityBoost >= 0 ? `+${item.sanityBoost}` : `${item.sanityBoost}`;
        const sanityClass = item.sanityBoost < 0 ? 'penalty' : '';
        let boostHtml = `<span class="action-card-tag ${sanityClass}"><i class="material-icons">sentiment_very_satisfied</i>${sanityLabel} Sanity (🧠)</span>`;
        if (item.hungerReduction) {
            boostHtml += `<span class="action-card-tag"><i class="material-icons">restaurant</i>-${item.hungerReduction} Energy Drain (⚡)</span>`;
        }
        return `
            <span class="action-card-tag price ${state.isLocked ? 'locked' : ''}"><i class="material-icons">payments</i>₡${item.cost}</span>
            ${boostHtml}
        `;
    }
}

export function createActionCard(
    type: ActionCardType,
    data: Job | Course | Item | Hustle,
    config: ActionCardConfig
): HTMLElement {
    const card = document.createElement('div');
    card.className = 'action-card';
    const automationKey = getActionCardAutomationKey(type, data);
    const cardTestId = `action-card-${type}-${automationKey}`;
    const buttonTestId = `action-card-btn-${type}-${automationKey}`;
    
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
    } else if (type === 'hustles') {
        const hustle = data as Hustle;
        title = hustle.title;
        state = getHustleState(hustle, config.player);
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
            <button class="btn btn-primary action-card-btn" data-testid="${buttonTestId}" ${state.isLocked || state.isCompleted ? 'disabled' : ''}>
                ${state.buttonText}
            </button>
        </div>
    `;

    card.dataset.actionCardType = type;
    card.dataset.actionCardKey = automationKey;
    card.dataset.testid = cardTestId;
    
    if (!state.isLocked && !state.isCompleted && config.onClick) {
        card.onclick = () => {
            config.onClick!(data, state.feedbackText, state.feedbackType);
        };
    }
    
    return card;
}

export function createActionCardList(
    type: ActionCardType,
    items: (Job | Course | Item | Hustle)[],
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
