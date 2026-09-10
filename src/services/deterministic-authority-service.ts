import { DeterministicPolicyEvaluator, compareDecisions, compareRuleMatches } from "../engine/deterministic-policy-evaluator.js";
import { IndependentRiskEngine } from "../engine/independent-risk-engine.js";
import { InMemoryAuthorityStore } from "../store/in-memory-authority-store.js";
import type { AssessRiskInput, EvaluatePolicyInput, PolicyDecisionRecord, ProgrammablePolicyDecision } from "../types/authority.js";
import { stableHash } from "../utils/stable-serialization.js";

function strongerDecision(left: ProgrammablePolicyDecision, right: ProgrammablePolicyDecision): ProgrammablePolicyDecision {
  return compareDecisions(left, right) <= 0 ? left : right;
}

export class DeterministicAuthorityService {
  constructor(
    private readonly store = new InMemoryAuthorityStore(),
    private readonly evaluator = new DeterministicPolicyEvaluator(),
    private readonly riskEngine = new IndependentRiskEngine()
  ) {}

  createPolicyVersion = this.store.createPolicyVersion.bind(this.store);
  activatePolicyVersion = this.store.activatePolicyVersion.bind(this.store);
  deactivatePolicyVersion = this.store.deactivatePolicyVersion.bind(this.store);
  createMandateVersion = this.store.createMandateVersion.bind(this.store);
  activateMandateVersion = this.store.activateMandateVersion.bind(this.store);
  revokeMandateVersion = this.store.revokeMandateVersion.bind(this.store);

  evaluatePolicy(input: EvaluatePolicyInput): PolicyDecisionRecord {
    const createdAt = input.createdAt ?? input.intent.tx_metadata.timestamp;
    const policyVersion = this.store.getPolicyVersion(input.policyId, input.policyVersion);
    if (!policyVersion) {
      throw new Error(`Unknown policy version: ${input.policyId}:${input.policyVersion}`);
    }

    const mandateVersion = input.mandateId && input.mandateVersion
      ? this.store.getMandateVersion(input.mandateId, input.mandateVersion)
      : undefined;

    if (input.mandateId && input.mandateVersion && !mandateVersion) {
      throw new Error(`Unknown mandate version: ${input.mandateId}:${input.mandateVersion}`);
    }

    const policyEvaluation = this.evaluator.evaluate({
      definition: policyVersion.definition,
      intent: input.intent,
      source: "policy",
      sourceId: input.policyId,
      sourceVersion: input.policyVersion
    });

    const mandateEvaluation = mandateVersion
      ? this.evaluator.evaluate({
          definition: mandateVersion.definition,
          intent: input.intent,
          source: "mandate",
          sourceId: mandateVersion.mandateId,
          sourceVersion: mandateVersion.version
        })
      : undefined;

    const matchedRules = [
      ...policyEvaluation.matchedRules,
      ...(mandateEvaluation?.matchedRules ?? [])
    ].sort(compareRuleMatches);

    const defaultDecision = mandateVersion
      ? strongerDecision(policyVersion.definition.defaultDecision, mandateVersion.definition.defaultDecision)
      : policyVersion.definition.defaultDecision;

    const decision = matchedRules[0]?.decision ?? defaultDecision;
    const reasonCodes = decision === "ALLOW"
      ? []
      : [...new Set(matchedRules
          .filter((rule) => rule.decision === decision)
          .flatMap((rule) => rule.reasonCode ? [rule.reasonCode] : []))].sort();

    const identity = {
      intentId: input.intent.tx_metadata.tx_id,
      policyId: input.policyId,
      policyVersion: input.policyVersion,
      policyHash: policyVersion.policyHash,
      mandateId: mandateVersion?.mandateId,
      mandateVersion: mandateVersion?.version,
      mandateHash: mandateVersion?.mandateHash,
      decision,
      reasonCodes,
      matchedRuleIds: matchedRules.map((rule) => `${rule.source}:${rule.ruleId}`)
    };
    const policyDecisionId = `pd_${stableHash(identity).slice(0, 16)}`;
    const inputHash = stableHash(input.intent);
    const decisionRecord: PolicyDecisionRecord = {
      policyDecisionId,
      intentId: input.intent.tx_metadata.tx_id,
      mandateId: mandateVersion?.mandateId,
      mandateVersion: mandateVersion?.version,
      mandateHash: mandateVersion?.mandateHash,
      policyId: input.policyId,
      policyVersion: input.policyVersion,
      policyHash: policyVersion.policyHash,
      decision,
      reasonCodes,
      matchedRules,
      createdAt,
      inputHash,
      decisionHash: stableHash({ policyDecisionId, ...identity, inputHash, createdAt })
    };

    return this.store.savePolicyDecision(decisionRecord);
  }

  assessRisk(input: AssessRiskInput) {
    return this.store.saveRiskAssessment(this.riskEngine.assess(input));
  }

  reconstructDecision(policyDecisionId: string, riskAssessmentId?: string) {
    return this.store.reconstruct(policyDecisionId, riskAssessmentId);
  }

  getStore() {
    return this.store;
  }
}
