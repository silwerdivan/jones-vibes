import { Clerk } from '../models/types';

export const CLERKS: Record<string, Clerk> = {
    "Labor Sector": { name: "Agent Smith", message: "Looking for a new start? I've got just the position for you.", icon: "clerk" },
    "Cognitive Re-Ed": { name: "Dean Wright", message: "Knowledge is the ultimate currency. Which course interests you?", icon: "clerk" },
    "Shopping Mall": { name: "Skylar", message: "Treat yourself! You've been working hard lately.", icon: "clerk" },
    "Sustenance Hub": { name: "Chip", message: "Welcome to Monolith Burger! Big bites for big dreams. What can I get you?", icon: "clerk" },
    "Used Car Lot": { name: "Honest Hal", message: "I've got a deal that'll put you in the fast lane today!", icon: "clerk" },
    "Cred-Debt Ctr": { name: "Teller 209", message: "Securing your future, one credit at a time. How can I assist?", icon: "clerk" }
};
