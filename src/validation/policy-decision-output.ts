import type { CanonicalPolicyDecisionOutput, PolicyDecisionResult } from "../types/policy.js";
import { isCanonicalReasonCode } from "../types/reason-codes.js";

const VALID_DECISIONS: PolicyDecisionResult[] = ["ALLOW", "DENY", "REVIEW", "CHALLENGE", "DELAY", "QUARANTINE"];
const REASON_CODE_REQUIRED_DECISIONS = new Set<PolicyDecisionResult>(["DENY", "REVIEW", "CHALLENGE", "DELAY", "QUARANTINE"]);

export interface PolicyDecisionOutputValidationResult {
  valid: boolean;
  errors: string[];
}

export function validatePolicyDecisionOutput(output: CanonicalPolicyDecisionOutput): PolicyDecisionOutputValidationResult {
  const errors: string[] = [];

  if (!VALID_DECISIONS.includes(output.decision)) {
    errors.push(`decision must be one of ${VALID_DECISIONS.join(", ")}`);
  }

  if (!Array.isArray(output.reason_codes)) {
    errors.push("reason_codes must be an array of strings");
  } else {
    const hasNonString = output.reason_codes.some((code) => typeof code !== "string");
    if (hasNonString) {
      errors.push("reason_codes must contain only strings");
    }

    const hasNonCanonical = output.reason_codes.some((code) => !isCanonicalReasonCode(code));
    if (hasNonCanonical) {
      errors.push("reason_codes must use canonical reason code prefixes");
    }

    if (REASON_CODE_REQUIRED_DECISIONS.has(output.decision) && output.reason_codes.length === 0) {
      errors.push(`${output.decision} decisions must include at least one reason code`);
    }
  }

  if (typeof output.policy_version !== "string" || output.policy_version.trim().length === 0) {
    errors.push("policy_version must be a non-empty string");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function assertValidPolicyDecisionOutput(output: CanonicalPolicyDecisionOutput): void {
  const validation = validatePolicyDecisionOutput(output);
  if (!validation.valid) {
    throw new Error(`Invalid policy decision output: ${validation.errors.join("; ")}`);
  }
}
