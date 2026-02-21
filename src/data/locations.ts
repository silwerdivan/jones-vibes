export const LOCATIONS = ["Home", "Employment Agency", "Community College", "Shopping Mall", "Fast Food", "Used Car Lot", "Bank"] as const;
export type LocationName = typeof LOCATIONS[number];
