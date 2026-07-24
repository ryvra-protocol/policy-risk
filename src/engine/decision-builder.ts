import { REASON_CODES, normalizeReasonCodes } from "../types/reason-codes.js";
import type { LimitsSnapshot, PolicyDecision, PolicyDecisionResult } from "../types/policy.js";
import { assertValidPolicyDecisionOutput } from "../validation/policy-decision-output.js";

function mapRuleToReasonCode(rule: string): string | undefined {
  switch (rule) {
    case "jurisdiction.restricted.hard_deny":
      return REASON_CODES.JURISDICTION_RESTRICTED_DESTINATION;
    case "limits.account_daily.exceeded":
      return REASON_CODES.LIMIT_EXCEEDED_ACCOUNT_DAILY;
    case "risk.score.high":
      return REASON_CODES.RISK_SCORE_HIGH_THRESHOLD;
    case "risk.score.borderline":
      return REASON_CODES.RISK_SCORE_HIGH_BORDERLINE_REVIEW;
    default:
      return undefined;
  }
}

function buildReasonCodes(decision: PolicyDecisionResult, appliedRules: string[]): string[] {
  if (decision === "ALLOW") {
    return [];
  }

  const mapped = appliedRules
    .map((rule) => mapRuleToReasonCode(rule))
    .filter((reasonCode): reasonCode is string => typeof reasonCode === "string");

  if (decision === "DENY" && mapped.length === 0) {
    return [REASON_CODES.RISK_SCORE_HIGH_THRESHOLD];
  }

  if (decision === "REVIEW" && mapped.length === 0) {
    return [REASON_CODES.RISK_SCORE_HIGH_BORDERLINE_REVIEW];
  }

  return normalizeReasonCodes(mapped);
}

export function buildDecision(input: {
  decision: PolicyDecisionResult;
  policyVersion: string;
  appliedRules: string[];
  limitsSnapshot: LimitsSnapshot;
  expiry: string;
}): PolicyDecision {
  const reason_codes = buildReasonCodes(input.decision, input.appliedRules);

  const output: PolicyDecision = {
    decision: input.decision,
    reason_codes,
    applied_rules: input.appliedRules,
    limits_snapshot: input.limitsSnapshot,
    expiry: input.expiry,
    policy_version: input.policyVersion
  };

  assertValidPolicyDecisionOutput(output);

  return output;
}
