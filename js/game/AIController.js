import { COURSES, SHOPPING_ITEMS } from './gameData.js';

class AIController {
    takeTurn(gameState, player) {
        // Priority 1: Pay Loan
        if (player.loan > 2000) {
            if (player.location !== 'Bank') {
                return { action: 'travel', params: { destination: 'Bank' } };
            } else {
                const amountToRepay = Math.min(player.loan, player.cash);
                if (amountToRepay > 0) {
                    return { action: 'repayLoan', params: { amount: amountToRepay } };
                }
                // If at Bank but cannot repay, fall through to next priority
            }
        }

        // Priority 2: Gain Wealth
        if (player.cash < 1000) {
            if (player.location !== 'Employment Agency') {
                return { action: 'travel', params: { destination: 'Employment Agency' } };
            } else {
                return { action: 'workShift' };
            }
        }

        // Priority 3: Advance Education
        if (player.educationLevel < COURSES.length) {
            const nextEducationLevel = player.educationLevel + 1;
            const nextCourse = COURSES.find(course => course.educationMilestone === nextEducationLevel);

            if (nextCourse && player.cash >= nextCourse.cost) {
                if (player.location !== 'Community College') {
                    return { action: 'travel', params: { destination: 'Community College' } };
                } else {
                    return { action: 'takeCourse', params: { courseId: nextCourse.id } };
                }
            }
            // If cannot afford next course or no more courses, fall through to next priority
        }

        // Priority 4: Boost Happiness
        if (player.happiness < 50) {
            if (player.location !== 'Shopping Mall') {
                return { action: 'travel', params: { destination: 'Shopping Mall' } };
            } else {
                const affordableItems = SHOPPING_ITEMS.filter(item => player.cash >= item.cost);
                if (affordableItems.length > 0) {
                    const mostExpensive = affordableItems.reduce((prev, current) => (prev.cost > current.cost) ? prev : current);
                    return { action: 'buyItem', params: { itemName: mostExpensive.name } };
                }
                // If at Shopping Mall but no affordable items, fall through to next priority
            }
        }

        // Priority 5: Increase Efficiency (Buy Car)
        if (player.cash > 3500 && !player.hasCar) {
            if (player.location !== 'Used Car Lot') {
                return { action: 'travel', params: { destination: 'Used Car Lot' } };
            } else {
                return { action: 'buyCar' };
            }
        }

        // Catch-all: If none of the above conditions are met, travel to the Employment Agency and workShift
        // If already at Employment Agency and cannot work, then pass turn.
        if (player.location !== 'Employment Agency') {
            return { action: 'travel', params: { destination: 'Employment Agency' } };
        } else {
            // Check if working a shift is possible (simplified check for now)
            // In a more complex AI, this would involve checking time, job availability, etc.
            // For now, assume if at Employment Agency, workShift is generally possible unless time is 0.
            if (player.time > 0) { // Basic check: can only work if there's time
                return { action: 'workShift' };
            } else {
                return { action: 'pass' }; // Explicitly pass if no other action is viable
            }
        }
    }
}

export default AIController;