import { REASON_CODES } from "../types/reason-codes.js";
import type { LimitsSnapshot, PolicyDecision, PolicyDecisionResult } from "../types/policy.js";

export function buildDecision(input: {
  decision: PolicyDecisionResult;
  policyVersion: string;
  appliedRules: string[];
  limitsSnapshot: LimitsSnapshot;
  expiry: string;
}): PolicyDecision {
  const reason_codes =
    input.decision === "DENY"
      ? [REASON_CODES.POLICY_DENY_RISK_HIGH]
      : input.decision === "REVIEW"
        ? [REASON_CODES.POLICY_REVIEW_RISK_BORDERLINE]
        : [REASON_CODES.POLICY_ALLOW_BASELINE];

  return {
    decision: input.decision,
    reason_codes,
    applied_rules: input.appliedRules,
    limits_snapshot: input.limitsSnapshot,
    expiry: input.expiry,
    policy_version: input.policyVersion
  };
}
