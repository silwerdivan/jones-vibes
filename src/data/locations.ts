export const LOCATIONS = ["Hab-Pod 404", "Labor Sector", "Cognitive Re-Ed", "Shopping Mall", "Sustenance Hub", "Used Car Lot", "Cred-Debt Ctr"] as const;
export type LocationName = typeof LOCATIONS[number];
