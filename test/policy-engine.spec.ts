import test from "node:test";
import assert from "node:assert/strict";

import { PolicyEngine } from "../src/engine/policy-engine.js";
import { validatePolicyDecisionOutput } from "../src/validation/policy-decision-output.js";

const engine = new PolicyEngine({
  policyVersion: "v1",
  accountDailyLimit: 10_000,
  defaultAssetLimit: 5_000
});

const baseInput = {
  account_profile: { account_id: "acct_1", risk_tier: "LOW" as const, kyc_kyb_status: "VERIFIED" as const },
  tx_metadata: { tx_id: "tx_1", tx_type: "PAYMENT", amount: 100, timestamp: "2026-01-01T00:00:00.000Z" },
  asset_attributes: { asset_id: "USDC", risk_class: "LOW" as const },
  jurisdiction_context: { origin: "US", destination: "US", restricted: false },
  velocity_metrics: { daily_amount: 100, epoch_amount: 100, daily_count: 1, epoch_count: 1 }
};

test("allows low risk payment", () => {
  const decision = engine.evaluate(baseInput);
  assert.equal(decision.decision, "ALLOW");
  assert.equal(decision.policy_version, "v1");
  assert.deepEqual(decision.reason_codes, []);
  assert.equal(validatePolicyDecisionOutput(decision).valid, true);
});

test("denies high risk transfer", () => {
  const decision = engine.evaluate({
    ...baseInput,
    tx_metadata: { ...baseInput.tx_metadata, amount: 5000 },
    account_profile: { ...baseInput.account_profile, risk_tier: "HIGH" },
    velocity_metrics: { ...baseInput.velocity_metrics, daily_amount: 11_000 }
  });

  assert.equal(decision.decision, "DENY");
  assert.equal(decision.policy_version, "v1");
  assert.ok(decision.reason_codes.length > 0);
  assert.equal(validatePolicyDecisionOutput(decision).valid, true);
});

test("marks borderline case for review", () => {
  const decision = engine.evaluate({
    ...baseInput,
    tx_metadata: { ...baseInput.tx_metadata, amount: 1200 },
    account_profile: { ...baseInput.account_profile, risk_tier: "MEDIUM" },
    velocity_metrics: { ...baseInput.velocity_metrics, daily_amount: 200 }
  });

  assert.equal(decision.decision, "REVIEW");
  assert.equal(decision.policy_version, "v1");
  assert.equal(validatePolicyDecisionOutput(decision).valid, true);
});
