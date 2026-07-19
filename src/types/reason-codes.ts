export const REASON_CODES = {
  POLICY_ALLOW_BASELINE: "policy.allow.baseline",
  POLICY_REVIEW_RISK_BORDERLINE: "policy.review.risk.borderline",
  POLICY_DENY_RISK_HIGH: "policy.deny.risk.high",
  POLICY_DENY_LIMIT_EXCEEDED: "policy.deny.limit.exceeded",
  COMPLIANCE_REVIEW_TIMEOUT: "compliance.review.timeout",
  COMPLIANCE_DENY_SANCTIONS_MATCH: "compliance.deny.sanctions.match",
  ABUSE_REVIEW_SIGNAL_MEDIUM: "abuse.review.signal.medium",
  ABUSE_DENY_SIGNAL_HIGH: "abuse.deny.signal.high"
} as const;

export type ReasonCode = (typeof REASON_CODES)[keyof typeof REASON_CODES];
