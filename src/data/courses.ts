import { Course } from '../models/types';

export const COURSES: Course[] = [
    { id: 1, name: "Found. Compl. (Level 1)", cost: 500, time: 8, educationMilestone: 1, requiredCredits: 50 },
    { id: 2, name: "Intermed. Prod (Level 2)", cost: 1000, time: 8, educationMilestone: 2, requiredCredits: 120 },
    { id: 3, name: "Sys-Integrate (Level 3)", cost: 2000, time: 8, educationMilestone: 3, requiredCredits: 250 },
    { id: 4, name: "Advanced Opt. (Level 4)", cost: 3000, time: 8, educationMilestone: 4, requiredCredits: 400 },
    { id: 5, name: "Peak Efficiency (Level 5)", cost: 5000, time: 8, educationMilestone: 5, requiredCredits: 600 },
];
