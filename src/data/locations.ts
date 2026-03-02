export const LOCATIONS = ["Hab-Pod 404", "Labor Sector", "Cognitive Re-Ed", "Consumpt-Zone", "Sustenance Hub", "Mobility-Asset", "Cred-Debt Ctr"] as const;
export type LocationName = typeof LOCATIONS[number];
