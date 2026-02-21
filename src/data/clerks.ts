import { Clerk } from '../models/types';
import { LocationName } from './locations';

export const CLERKS: Partial<Record<LocationName, Clerk>> = {
    "Employment Agency": { name: "Agent Smith", message: "Looking for a new start? I've got just the position for you.", icon: "clerk" },
    "Community College": { name: "Dean Wright", message: "Knowledge is the ultimate currency. Which course interests you?", icon: "clerk" },
    "Shopping Mall": { name: "Skylar", message: "Treat yourself! You've been working hard lately.", icon: "clerk" },
    "Fast Food": { name: "Chip", message: "Welcome to Monolith Burger! Big bites for big dreams. What can I get you?", icon: "clerk" },
    "Used Car Lot": { name: "Honest Hal", message: "I've got a deal that'll put you in the fast lane today!", icon: "clerk" },
    "Bank": { name: "Teller 209", message: "Securing your future, one credit at a time. How can I assist?", icon: "clerk" }
};
