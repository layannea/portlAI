export type Score = "green" | "yellow" | "red";

export type FactorName =
  | "performance"
  | "fees"
  | "liquidity"
  | "valuation"
  | "benchmarking"
  | "complexity";

export interface Citation {
  source: string;
  sourceType:
    | "SEC_EDGAR"
    | "SEC_IAPD_ADV"
    | "UPLOADED_DOC"
    | "PEER_DATASET"
    | "PLAN_PROFILE";
  filingType?:
    | "N-1A"
    | "N-PORT"
    | "N-CEN"
    | "N-CSR"
    | "ADV_PART_1"
    | "ADV_PART_2A"
    | "PPM"
    | "LPA";
  page?: number;
  quote: string;
  sourceUrl?: string;
  documentId?: string;
}

export interface FactorEvaluation {
  factor: FactorName;
  score: Score;
  rationale: string;
  peerComparison: string;
  citations: [Citation, ...Citation[]];
  inputHash: string;
}

// Keyed by FactorName — enforces exactly one evaluation per factor (all 6 required).
export type FactorMap = Record<FactorName, FactorEvaluation>;

// ─── Fund types ──────────────────────────────────────────────────────────────

export type PublicFundStructure = "mutual_fund" | "etf" | "collective_investment_trust";
export type AssetClass =
  | "equity"
  | "fixed_income"
  | "multi_asset"
  | "alternatives"
  | "money_market";
export type ManagementStyle = "active" | "passive" | "factor";

export interface PublicFund {
  id: string;
  name: string;
  ticker: string;
  isin?: string;
  provider: string;
  assetClass: AssetClass;
  structure: PublicFundStructure;
  managementStyle: ManagementStyle;
  benchmarkIndex: string;
  expenseRatioBps: number;
  inceptionDate: string;
  aumUsd: number;
  factors: FactorMap;
}

export type PrivateFundStrategy =
  | "private_equity"
  | "private_credit"
  | "hedge_fund"
  | "real_estate"
  | "infrastructure"
  | "fund_of_funds";

export type RedemptionFrequency = "monthly" | "quarterly" | "annual" | "none";

export interface PrivateFund {
  id: string;
  name: string;
  generalPartner: string;
  strategy: PrivateFundStrategy;
  vintageYear?: number;
  managementFeePct: number;
  carriedInterestPct: number;
  hurdleRatePct?: number;
  minimumInvestmentUsd: number;
  lockupMonths?: number;
  redemptionFrequency?: RedemptionFrequency;
  aumUsd: number;
  ilpaCompliant: boolean;
  factors: FactorMap;
}

// ─── Audit log ───────────────────────────────────────────────────────────────

export type AuditEventType =
  | "WORKSPACE_CREATED"
  | "FUND_ADDED"
  | "FUND_REMOVED"
  | "FUND_EVALUATED"
  | "FACTOR_RESCORED"
  | "SCORE_OVERRIDDEN"
  | "DOCUMENT_UPLOADED"
  | "REPORT_GENERATED"
  | "COMMENT_ADDED";

export interface AuditEvent {
  id: string;
  timestamp: string;
  eventType: AuditEventType;
  description: string;
  userId: string;
  relatedFundId?: string;
  metadata?: Record<string, unknown>;
}

// ─── Workspace ───────────────────────────────────────────────────────────────

export type PlanType =
  | "401k"
  | "403b"
  | "457b"
  | "457f"
  | "defined_benefit"
  | "profit_sharing";

export interface PlanSponsor {
  name: string;
  ein: string;
}

export interface PlanAdministrator {
  name: string;
  title: string;
  email: string;
}

export interface Workspace {
  id: string;
  name: string;
  planType: PlanType;
  sponsor: PlanSponsor;
  administrator: PlanAdministrator;
  totalAssetsUsd: number;
  publicFunds: PublicFund[];
  privateFunds: PrivateFund[];
  auditLog: AuditEvent[];
  createdAt: string;
  updatedAt: string;
}
