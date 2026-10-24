export const PERIODS = ["7days", "1month", "3months", "6months", "1year", "overall"] as const;
export type Period = (typeof PERIODS)[number];
