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
    takeTurn(_gameState: GameState, player: Player): AIAction {
        const currentJob = JOBS.find(job => job.level === player.careerLevel);
        const workShiftHours = currentJob ? currentJob.shiftHours : 8; // Default to 8 if no job
        const travelTime = player.hasCar ? 1 : 2;

        // Priority 1: Pay Loan (Banking is instant once at the location)
        if (player.loan > 2000 && player.cash > 0) {
            if (player.location !== 'Cred-Debt Ctr') {
                if (player.time >= travelTime) {
                    return { action: 'travel', params: { destination: 'Cred-Debt Ctr' } };
                }
            } else {
                const amountToRepay = Math.min(player.loan, player.cash);
                if (amountToRepay > 0) {
                    return { action: 'repayLoan', params: { amount: amountToRepay } };
                }
            }
        }

        // Priority 2: Hunger Management (Threshold 30 to prevent turn-end penalty)
        if (player.hunger > 30) {
            const affordableFood = SHOPPING_ITEMS.filter(item => 
                item.location === 'Sustenance Hub' && player.cash >= item.cost
            );

            if (affordableFood.length > 0) {
                if (player.location === 'Sustenance Hub') {
                    const bestFood = affordableFood.reduce((prev, current) => 
                        ((prev.hungerReduction || 0) > (current.hungerReduction || 0)) ? prev : current
                    );
                    return { action: 'buyItem', params: { itemName: bestFood.name } };
                } else if (player.time >= travelTime) {
                    return { action: 'travel', params: { destination: 'Sustenance Hub' } };
                }
            }
        }

        // Priority 3: Gain Wealth (Work takes time)
        if (player.cash < 1000 && player.time >= workShiftHours) {
            if (player.location !== 'Labor Sector') {
                if (player.time >= travelTime) {
                    return { action: 'travel', params: { destination: 'Labor Sector' } };
                }
            } else {
                if (player.careerLevel === 0) {
                    const availableJobs = JOBS.filter(job => player.educationLevel >= job.educationRequired);
                    if (availableJobs.length > 0) {
                        const highestLevelJob = availableJobs.reduce((prev, current) =>
                            (prev.level > current.level) ? prev : current
                        );
                        return { action: 'applyForJob', params: { jobLevel: highestLevelJob.level } };
                    }
                } else {
                    return { action: 'workShift' };
                }
            }
        }

        // Priority 4: Advance Education (Progress Bar System)
        if (player.educationLevel < COURSES.length) {
            const nextEducationLevel = player.educationLevel + 1;
            const nextCourse = COURSES.find(course => course.educationMilestone === nextEducationLevel);

            if (nextCourse) {
                // Enrollment (tuition)
                if (player.educationCreditsGoal < nextCourse.requiredCredits && player.cash >= nextCourse.cost) {
                    const enrollmentTime = 1;
                    if (player.location !== 'Cognitive Re-Ed') {
                        if (player.time >= travelTime + enrollmentTime) {
                            return { action: 'travel', params: { destination: 'Cognitive Re-Ed' } };
                        }
                    } else if (player.time >= enrollmentTime) {
                        return { action: 'takeCourse', params: { courseId: nextCourse.id } };
                    }
                }

                // Study sessions
                const studyTime = 8;
                const happinessCost = 5;
                if (player.educationCreditsGoal >= nextCourse.requiredCredits && 
                    player.time >= studyTime && 
                    player.happiness >= happinessCost) {
                    
                    if (player.location !== 'Cognitive Re-Ed') {
                        if (player.time >= travelTime + studyTime) {
                            return { action: 'travel', params: { destination: 'Cognitive Re-Ed' } };
                        }
                    } else {
                        return { action: 'study' };
                    }
                }
            }
        }

        // Priority 5: Boost Happiness (Shopping is instant once at the location)
        if (player.happiness < 50) {
            const affordableItems = SHOPPING_ITEMS.filter(item => 
                item.location === 'Shopping Mall' && player.cash >= item.cost
            );
            
            if (affordableItems.length > 0) {
                if (player.location === 'Shopping Mall') {
                    const mostExpensive = affordableItems.reduce((prev, current) => (prev.cost > current.cost) ? prev : current);
                    return { action: 'buyItem', params: { itemName: mostExpensive.name } };
                } else if (player.time >= travelTime) {
                    return { action: 'travel', params: { destination: 'Shopping Mall' } };
                }
            }
        }

        // Priority 6: Increase Efficiency (Buying car takes time, but AI checks if it can afford it first)
        if (player.cash > 3500 && !player.hasCar) {
            const carCostTime = 4;
            if (player.location === 'Used Car Lot') {
                if (player.time >= carCostTime) {
                    return { action: 'buyCar' };
                }
            } else if (player.time >= travelTime + carCostTime) {
                return { action: 'travel', params: { destination: 'Used Car Lot' } };
            }
        }

        if (player.location === 'Labor Sector' && player.time >= workShiftHours && player.careerLevel > 0) {
            return { action: 'workShift' };
        }
        
        return { action: 'pass' };
    }
}

export default AIController;