export interface FundTarget {
  ticker: string;
  expectedName: string;
}

export const FUND_TARGETS: readonly FundTarget[] = [
  { ticker: "VFIFX", expectedName: "Vanguard Target Retirement 2050 Fund" },
  { ticker: "FXAIX", expectedName: "Fidelity 500 Index Fund" },
  { ticker: "VBTLX", expectedName: "Vanguard Total Bond Market Index Fund Admiral Shares" },
  { ticker: "TRBCX", expectedName: "T. Rowe Price Blue Chip Growth Fund" },
  { ticker: "AGTHX", expectedName: "American Funds Growth Fund of America Class A" },
  { ticker: "SWPPX", expectedName: "Schwab S&P 500 Index Fund" },
  { ticker: "VSMAX", expectedName: "Vanguard Small-Cap Index Fund Admiral Shares" },
  { ticker: "FSPSX", expectedName: "Fidelity International Index Fund" },
] as const;
