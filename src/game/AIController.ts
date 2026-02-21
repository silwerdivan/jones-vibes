import { COURSES } from '../data/courses';
import { SHOPPING_ITEMS } from '../data/items';
import { JOBS } from '../data/jobs';
import Player from './Player';
import GameState from './GameState';

interface AIAction {
    action: string;
    params?: any;
}

class AIController {
    takeTurn(gameState: GameState, player: Player): AIAction {
        const currentJob = JOBS.find(job => job.level === player.careerLevel);
        const workShiftHours = currentJob ? currentJob.shiftHours : 8; // Default to 8 if no job

        // Priority 1: Pay Loan
        if (player.loan > 2000 && player.time >= 2) { // Assume banking takes 2 hours
            if (player.location !== 'Bank') {
                return { action: 'travel', params: { destination: 'Bank' } };
            } else {
                const amountToRepay = Math.min(player.loan, player.cash);
                if (amountToRepay > 0) {
                    return { action: 'repayLoan', params: { amount: amountToRepay } };
                }
            }
        }

        // Priority 2: Gain Wealth
        if (player.cash < 1000 && player.time >= workShiftHours) {
            if (player.location !== 'Employment Agency') {
                return { action: 'travel', params: { destination: 'Employment Agency' } };
            } else {
                // Check if AI is unemployed (careerLevel === 0)
                if (player.careerLevel === 0) {
                    // Find the highest level job the AI qualifies for
                    const availableJobs = JOBS.filter(job => player.educationLevel >= job.educationRequired);
                    if (availableJobs.length > 0) {
                        // Get the highest level job available
                        const highestLevelJob = availableJobs.reduce((prev, current) =>
                            (prev.level > current.level) ? prev : current
                        );
                        return { action: 'applyForJob', params: { jobLevel: highestLevelJob.level } };
                    }
                }
                return { action: 'workShift' };
            }
        }

        // Priority 3: Advance Education
        if (player.educationLevel < COURSES.length) {
            const nextEducationLevel = player.educationLevel + 1;
            const nextCourse = COURSES.find(course => course.educationMilestone === nextEducationLevel);

            if (nextCourse && player.cash >= nextCourse.cost && player.time >= nextCourse.time) {
                if (player.location !== 'Community College') {
                    return { action: 'travel', params: { destination: 'Community College' } };
                } else {
                    return { action: 'takeCourse', params: { courseId: nextCourse.id } };
                }
            }
        }

        // Priority 4: Boost Happiness
        if (player.happiness < 50 && player.time >= 2) { // Assume shopping takes 2 hours
            if (player.location !== 'Shopping Mall') {
                return { action: 'travel', params: { destination: 'Shopping Mall' } };
            } else {
                const affordableItems = SHOPPING_ITEMS.filter(item => player.cash >= item.cost);
                if (affordableItems.length > 0) {
                    const mostExpensive = affordableItems.reduce((prev, current) => (prev.cost > current.cost) ? prev : current);
                    return { action: 'buyItem', params: { itemName: mostExpensive.name } };
                }
            }
        }

        // Priority 5: Increase Efficiency (Buy Car)
        if (player.cash > 3500 && !player.hasCar && player.time >= 4) { // Assume buying a car takes 4 hours
            if (player.location !== 'Used Car Lot') {
                return { action: 'travel', params: { destination: 'Used Car Lot' } };
            } else {
                return { action: 'buyCar' };
            }
        }

        // Catch-all: If other priorities are not met, work if possible and employed.
        if (player.location === 'Employment Agency' && player.time >= workShiftHours && player.careerLevel > 0) {
            return { action: 'workShift' };
        }
        
        // If no other action is viable, pass the turn.
        return { action: 'pass' };
    }
}

export default AIController;