
export const LOCATIONS = ["Home", "Employment Agency", "Community College", "Shopping Mall", "Fast Food", "Used Car Lot", "Bank"];

export const CLERKS = {
    "Employment Agency": { name: "Agent Smith", message: "Looking for a new start? I've got just the position for you.", icon: "clerk" },
    "Community College": { name: "Dean Wright", message: "Knowledge is the ultimate currency. Which course interests you?", icon: "clerk" },
    "Shopping Mall": { name: "Skylar", message: "Treat yourself! You've been working hard lately.", icon: "clerk" },
    "Fast Food": { name: "Chip", message: "Welcome to Monolith Burger! Big bites for big dreams. What can I get you?", icon: "clerk" },
    "Used Car Lot": { name: "Honest Hal", message: "I've got a deal that'll put you in the fast lane today!", icon: "clerk" },
    "Bank": { name: "Teller 209", message: "Securing your future, one credit at a time. How can I assist?", icon: "clerk" }
};

export const JOBS = [
    { level: 1, title: 'Dishwasher', wage: 8, shiftHours: 6, educationRequired: 0 },
    { level: 2, title: 'Fast Food Worker', wage: 10, shiftHours: 7, educationRequired: 1 },
    { level: 3, title: 'Retail Associate', wage: 12, shiftHours: 8, educationRequired: 2 },
    { level: 4, title: 'Office Clerk', wage: 15, shiftHours: 8, educationRequired: 3 },
    { level: 5, title: 'Junior Accountant', wage: 20, shiftHours: 8, educationRequired: 4 },
];

export const COURSES = [
    { id: 1, name: 'Intro to Business', cost: 500, time: 10, educationMilestone: 1 },
    { id: 2, name: 'Marketing Fundamentals', cost: 750, time: 15, educationMilestone: 2 },
    { id: 3, name: 'Financial Accounting', cost: 1000, time: 20, educationMilestone: 3 },
    { id: 4, name: 'Business Law', cost: 1250, time: 25, educationMilestone: 4 },
    { id: 5, name: 'Advanced Management', cost: 1500, time: 30, educationMilestone: 5 },
];

export const SHOPPING_ITEMS = [
    { name: 'Coffee', cost: 5, happinessBoost: 5, type: 'essential', location: 'Shopping Mall' },
    { name: 'Movie Ticket', cost: 15, happinessBoost: 10, type: 'essential', location: 'Shopping Mall' },
    { name: 'New Clothes', cost: 50, happinessBoost: 20, type: 'essential', icon: 'clothes', benefit: 'Social Standing +5%', location: 'Shopping Mall' },
    { name: 'Concert Ticket', cost: 100, happinessBoost: 30, type: 'essential', location: 'Shopping Mall' },
    { name: 'Fridge', cost: 400, happinessBoost: 10, type: 'asset', icon: 'fridge', benefit: 'Food Waste -50%', location: 'Shopping Mall' },
    { name: 'Television', cost: 600, happinessBoost: 40, type: 'asset', icon: 'television', benefit: 'Relaxation +10%', location: 'Shopping Mall' },
    { name: 'Computer', cost: 1200, happinessBoost: 25, type: 'asset', icon: 'computer', benefit: 'Study Speed +15%', location: 'Shopping Mall' },
    { name: 'Vacation Package', cost: 500, happinessBoost: 50, type: 'essential', location: 'Shopping Mall' },
    { name: 'Monolith Burger', cost: 10, happinessBoost: 5, type: 'essential', hungerReduction: 40, location: 'Fast Food' },
    { name: 'Synth-Salad', cost: 12, happinessBoost: 8, type: 'essential', hungerReduction: 30, location: 'Fast Food' }
];
