import test from "node:test";
import assert from "node:assert/strict";

import { parsePolicyDsl, validatePolicyDsl } from "../src/dsl/policy-dsl.js";

const validYamlDsl = `
version: v1.0.0
defaultDecision: ALLOW
rules:
  - id: deny_restricted
    priority: 100
    decision: DENY
    reasonCode: JURISDICTION_RESTRICTED_DESTINATION
    conditions:
      all:
        - fact: jurisdiction_context.restricted
          operator: EQUALS
          value: true
  - id: review_medium_risk
    priority: 50
    decision: REVIEW
    reasonCode: RISK_SCORE_HIGH_BORDERLINE_REVIEW
    conditions:
      all:
        - fact: account_profile.risk_tier
          operator: EQUALS
          value: MEDIUM
`;

test("parses valid YAML DSL deterministically", () => {
  const parsed = parsePolicyDsl(validYamlDsl);

  assert.equal(parsed.version, "v1.0.0");
  assert.equal(parsed.rules.length, 2);
  assert.equal(parsed.rules[0]?.reasonCode, "JURISDICTION_RESTRICTED_DESTINATION");
  assert.deepEqual(parsePolicyDsl(validYamlDsl), parsed);
});

test("accepts JSON object DSL", () => {
  const parsed = parsePolicyDsl({
    version: "v1.0.1",
    defaultDecision: "ALLOW",
    rules: [
      {
        id: "delay_velocity",
        priority: 10,
        decision: "DELAY",
        reasonCode: "VELOCITY_EXCEEDED_DELAY_WINDOW",
        conditions: {
          all: [{ fact: "velocity_metrics.daily_amount", operator: "GTE", value: 9000 }]
        }
      }
    ]
  });

  assert.equal(parsed.rules[0]?.decision, "DELAY");
});

test("rejects invalid DSL", () => {
  const result = validatePolicyDsl({
    version: "1",
    defaultDecision: "ALLOW",
    rules: [
      {
        id: "broken",
        priority: 1,
        decision: "DENY",
        conditions: {
          all: [{ fact: "tx_metadata.amount", operator: "BAD", value: 1 }]
        }
      }
    ]
  } as never);

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("version must match")));
  assert.ok(result.errors.some((error) => error.includes("reasonCode must be provided")));
  assert.ok(result.errors.some((error) => error.includes("operator must be one of")));
});
