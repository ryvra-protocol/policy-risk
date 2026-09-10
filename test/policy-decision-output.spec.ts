import test from "node:test";
import assert from "node:assert/strict";

import { validatePolicyDecisionOutput } from "../src/validation/policy-decision-output.js";

test("DENY with empty reason_codes is invalid", () => {
  const result = validatePolicyDecisionOutput({
    decision: "DENY",
    reason_codes: [],
    policy_version: "v1"
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("DENY decisions must include at least one reason code")));
});

test("non-canonical reason code prefix is invalid", () => {
  const result = validatePolicyDecisionOutput({
    decision: "DENY",
    reason_codes: ["policy.deny.risk.high"],
    policy_version: "v1"
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("canonical reason code prefixes")));
});

test("ALLOW can pass with empty reason_codes", () => {
  const result = validatePolicyDecisionOutput({
    decision: "ALLOW",
    reason_codes: [],
    policy_version: "v1"
  });

  assert.equal(result.valid, true);
});

test("REVIEW requires a reason code", () => {
  const result = validatePolicyDecisionOutput({
    decision: "REVIEW",
    reason_codes: [],
    policy_version: "v1"
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("REVIEW decisions must include at least one reason code")));
});

test("CHALLENGE is a supported decision", () => {
  const result = validatePolicyDecisionOutput({
    decision: "CHALLENGE",
    reason_codes: ["RISK_SCORE_HIGH_CHALLENGE_REQUIRED"],
    policy_version: "v1.0.0"
  });

  assert.equal(result.valid, true);
});
