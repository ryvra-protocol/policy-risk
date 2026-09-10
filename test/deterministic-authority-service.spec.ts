import test from "node:test";
import assert from "node:assert/strict";

import { DeterministicAuthorityService } from "../src/services/deterministic-authority-service.js";
import type { PolicyInput } from "../src/types/policy.js";

const baseIntent: PolicyInput = {
  account_profile: { account_id: "acct_1", risk_tier: "LOW", kyc_kyb_status: "VERIFIED" },
  tx_metadata: { tx_id: "tx_1", tx_type: "PAYMENT", amount: 200, timestamp: "2026-01-01T00:00:00.000Z" },
  asset_attributes: { asset_id: "USDC", risk_class: "LOW" },
  jurisdiction_context: { origin: "US", destination: "US", restricted: false },
  velocity_metrics: { daily_amount: 100, epoch_amount: 100, daily_count: 1, epoch_count: 1 }
};

function createService() {
  const service = new DeterministicAuthorityService();

  service.createPolicyVersion({
    policyId: "payments",
    version: "v1.0.0",
    createdAt: "2026-01-01T00:00:00.000Z",
    dsl: {
      version: "v1.0.0",
      defaultDecision: "ALLOW",
      rules: [
        {
          id: "deny_restricted",
          priority: 10,
          decision: "DENY",
          reasonCode: "JURISDICTION_RESTRICTED_DESTINATION",
          conditions: { all: [{ fact: "jurisdiction_context.restricted", operator: "EQUALS", value: true }] }
        },
        {
          id: "allow_usdc",
          priority: 999,
          decision: "ALLOW",
          conditions: { all: [{ fact: "asset_attributes.asset_id", operator: "EQUALS", value: "USDC" }] }
        },
        {
          id: "review_medium_risk",
          priority: 20,
          decision: "REVIEW",
          reasonCode: "RISK_SCORE_HIGH_BORDERLINE_REVIEW",
          conditions: { all: [{ fact: "account_profile.risk_tier", operator: "EQUALS", value: "MEDIUM" }] }
        }
      ]
    }
  });
  service.activatePolicyVersion("payments", "v1.0.0", "2026-01-01T00:01:00.000Z");

  service.createMandateVersion({
    mandateId: "governance",
    version: "v1.0.0",
    createdAt: "2026-01-01T00:00:00.000Z",
    dsl: {
      version: "v1.0.0",
      defaultDecision: "ALLOW",
      rules: [
        {
          id: "challenge_large_transfer",
          priority: 1,
          decision: "CHALLENGE",
          reasonCode: "RISK_SCORE_HIGH_CHALLENGE_REQUIRED",
          conditions: { all: [{ fact: "tx_metadata.amount", operator: "GTE", value: 1000 }] }
        }
      ]
    }
  });
  service.activateMandateVersion("governance", "v1.0.0", "2026-01-01T00:02:00.000Z");

  return service;
}

test("rule evaluation is deterministic and DENY outranks ALLOW", () => {
  const service = createService();
  const restrictedIntent: PolicyInput = {
    ...baseIntent,
    jurisdiction_context: { ...baseIntent.jurisdiction_context, restricted: true }
  };

  const first = service.evaluatePolicy({
    intent: restrictedIntent,
    policyId: "payments",
    policyVersion: "v1.0.0"
  });
  const second = service.evaluatePolicy({
    intent: restrictedIntent,
    policyId: "payments",
    policyVersion: "v1.0.0"
  });

  assert.equal(first.decision, "DENY");
  assert.deepEqual(first, second);
  assert.deepEqual(first.reasonCodes, ["JURISDICTION_RESTRICTED_DESTINATION"]);
  assert.deepEqual(first.matchedRules.map((rule) => rule.ruleId), ["deny_restricted", "allow_usdc"]);
});

test("mandate and policy active versions are immutable once activated", () => {
  const service = createService();
  const store = service.getStore();
  const policyVersion = store.getPolicyVersion("payments", "v1.0.0");
  const mandateVersion = store.getMandateVersion("governance", "v1.0.0");

  assert.ok(policyVersion?.policyHash);
  assert.ok(mandateVersion?.mandateHash);
  assert.throws(() => service.createPolicyVersion({
    policyId: "payments",
    version: "v1.0.0",
    dsl: { version: "v1.0.0", defaultDecision: "ALLOW", rules: [] }
  }));

  if (!policyVersion || !mandateVersion) {
    throw new Error("expected active versions");
  }

  policyVersion.definition.rules[0]!.priority = 0;
  mandateVersion.definition.rules[0]!.priority = 0;

  assert.equal(store.getPolicyVersion("payments", "v1.0.0")?.definition.rules[0]?.priority, 10);
  assert.equal(store.getMandateVersion("governance", "v1.0.0")?.definition.rules[0]?.priority, 1);
});

test("mandate decisions can override policy defaults while preserving deterministic ordering", () => {
  const service = createService();
  const decision = service.evaluatePolicy({
    intent: {
      ...baseIntent,
      tx_metadata: { ...baseIntent.tx_metadata, amount: 2500 }
    },
    policyId: "payments",
    policyVersion: "v1.0.0",
    mandateId: "governance",
    mandateVersion: "v1.0.0"
  });

  assert.equal(decision.decision, "CHALLENGE");
  assert.deepEqual(decision.reasonCodes, ["RISK_SCORE_HIGH_CHALLENGE_REQUIRED"]);
  assert.deepEqual(decision.matchedRules.map((rule) => `${rule.source}:${rule.ruleId}`), [
    "mandate:challenge_large_transfer",
    "policy:allow_usdc"
  ]);
});

test("risk assessment is independent, persisted, and audit records are reconstructable", () => {
  const service = createService();
  const decision = service.evaluatePolicy({
    intent: {
      ...baseIntent,
      tx_metadata: { ...baseIntent.tx_metadata, amount: 2500 }
    },
    policyId: "payments",
    policyVersion: "v1.0.0",
    mandateId: "governance",
    mandateVersion: "v1.0.0"
  });
  const originalDecision = structuredClone(decision);

  const assessment = service.assessRisk({
    intent: {
      ...baseIntent,
      tx_metadata: { ...baseIntent.tx_metadata, amount: 2500 }
    },
    policyDecision: decision,
    riskSignals: {
      accountRiskScore: 50,
      abuseSignalLevel: "MEDIUM"
    }
  });

  assert.deepEqual(decision, originalDecision);
  assert.equal(assessment.policyDecisionId, decision.policyDecisionId);
  assert.equal(assessment.riskTier, "HIGH");
  assert.equal(assessment.decision, "ESCALATE");

  const reconstruction = service.reconstructDecision(decision.policyDecisionId, assessment.riskAssessmentId);
  assert.deepEqual(reconstruction.policyDecision, decision);
  assert.equal(reconstruction.policyVersion.policyHash, decision.policyHash);
  assert.equal(reconstruction.mandateVersion?.mandateHash, decision.mandateHash);
  assert.equal(reconstruction.riskAssessment?.assessmentHash, assessment.assessmentHash);

  const tables = service.getStore().tables;
  assert.equal(tables.policy_decisions.length, 1);
  assert.equal(tables.risk_assessments.length, 1);
});
