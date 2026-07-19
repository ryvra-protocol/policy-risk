import type { ReasonCode } from "./reason-codes.js";

export type PolicyDecisionResult = "ALLOW" | "DENY" | "REVIEW";

export interface AccountProfile {
  account_id: string;
  risk_tier?: "LOW" | "MEDIUM" | "HIGH";
  kyc_kyb_status?: "VERIFIED" | "PENDING" | "FAILED";
}

export interface TransactionMetadata {
  tx_id: string;
  tx_type: string;
  amount: number;
  timestamp: string;
}

export interface AssetAttributes {
  asset_id: string;
  risk_class?: "LOW" | "MEDIUM" | "HIGH";
}

export interface JurisdictionContext {
  origin?: string;
  destination?: string;
  restricted?: boolean;
}

export interface VelocityMetrics {
  daily_amount: number;
  epoch_amount: number;
  daily_count: number;
  epoch_count: number;
}

export interface PolicyInput {
  account_profile: AccountProfile;
  tx_metadata: TransactionMetadata;
  asset_attributes: AssetAttributes;
  jurisdiction_context: JurisdictionContext;
  velocity_metrics: VelocityMetrics;
}

export interface LimitsSnapshot {
  account_daily_limit: number;
  asset_limit: number;
  observed_daily_amount: number;
}

export interface PolicyDecision {
  decision: PolicyDecisionResult;
  reason_codes: ReasonCode[];
  applied_rules: string[];
  limits_snapshot: LimitsSnapshot;
  expiry: string;
  policy_version: string;
}
