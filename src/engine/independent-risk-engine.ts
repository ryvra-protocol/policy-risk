import type { AssessRiskInput, RiskAssessmentRecord, RiskDecision, RiskFactor, RiskTier } from "../types/authority.js";
import { stableHash } from "../utils/stable-serialization.js";

function mapAbuseSignalWeight(level: "LOW" | "MEDIUM" | "HIGH" | undefined): number {
  switch (level) {
    case "HIGH":
      return 35;
    case "MEDIUM":
      return 20;
    case "LOW":
      return 5;
    default:
      return 0;
  }
}

function getRiskTier(score: number): RiskTier {
  if (score >= 90) {
    return "CRITICAL";
  }

  if (score >= 70) {
    return "HIGH";
  }

  if (score >= 40) {
    return "MEDIUM";
  }

  return "LOW";
}

function getRiskDecision(score: number): RiskDecision {
  if (score >= 90) {
    return "DENY";
  }

  if (score >= 70) {
    return "ESCALATE";
  }

  if (score >= 40) {
    return "REVIEW";
  }

  return "APPROVE";
}

export class IndependentRiskEngine {
  assess(input: AssessRiskInput): RiskAssessmentRecord {
    const createdAt = input.createdAt ?? input.policyDecision.createdAt;
    const manualFlags = input.riskSignals?.manualFlags ?? [];

    const factors: RiskFactor[] = [
      {
        code: "TX_AMOUNT",
        weight: input.intent.tx_metadata.amount >= 5_000 ? 30 : input.intent.tx_metadata.amount >= 1_000 ? 15 : 5,
        value: input.intent.tx_metadata.amount,
        reasoning: "Transaction size contributes deterministic exposure weight."
      },
      {
        code: "ACCOUNT_RISK",
        weight: Math.max(0, Math.min(30, Math.round((input.riskSignals?.accountRiskScore ?? 0) / 3.34))),
        value: input.riskSignals?.accountRiskScore ?? 0,
        reasoning: "External account risk score is normalized into a fixed contribution."
      },
      {
        code: "POLICY_DECISION",
        weight: input.policyDecision.decision === "DENY" || input.policyDecision.decision === "QUARANTINE"
          ? 35
          : input.policyDecision.decision === "CHALLENGE"
            ? 25
            : input.policyDecision.decision === "DELAY"
              ? 15
              : input.policyDecision.decision === "REVIEW"
                ? 20
                : 0,
        value: input.policyDecision.decision,
        reasoning: "Policy outcome informs risk without mutating policy authority."
      },
      {
        code: "ABUSE_SIGNAL",
        weight: mapAbuseSignalWeight(input.riskSignals?.abuseSignalLevel),
        value: input.riskSignals?.abuseSignalLevel ?? "NONE",
        reasoning: "Abuse signals are translated into fixed deterministic weights."
      },
      {
        code: "MANDATE_MATCH",
        weight: input.policyDecision.mandateId ? 10 : 0,
        value: Boolean(input.policyDecision.mandateId),
        reasoning: "Mandate-linked decisions receive an additional governance scrutiny weight."
      },
      {
        code: "MANUAL_FLAGS",
        weight: Math.min(20, manualFlags.length * 5),
        value: manualFlags.length,
        reasoning: "Each manual flag contributes a bounded deterministic increment."
      }
    ];

    const score = Math.min(100, factors.reduce((sum, factor) => sum + factor.weight, 0));
    const riskTier = getRiskTier(score);
    const decision = getRiskDecision(score);
    const reasoning = factors
      .filter((factor) => factor.weight > 0)
      .map((factor) => `${factor.code}=${factor.weight}`)
      .join("; ");

    const identity = {
      intentId: input.intent.tx_metadata.tx_id,
      policyDecisionId: input.policyDecision.policyDecisionId,
      policyHash: input.policyDecision.policyHash,
      mandateHash: input.policyDecision.mandateHash,
      factors,
      score,
      decision,
      riskTier
    };
    const riskAssessmentId = `risk_${stableHash(identity).slice(0, 16)}`;
    const assessmentHash = stableHash({ riskAssessmentId, ...identity, createdAt, reasoning });

    return {
      riskAssessmentId,
      intentId: input.intent.tx_metadata.tx_id,
      mandateId: input.policyDecision.mandateId,
      mandateHash: input.policyDecision.mandateHash,
      policyDecisionId: input.policyDecision.policyDecisionId,
      policyHash: input.policyDecision.policyHash,
      riskTier,
      score,
      factors,
      decision,
      reasoning,
      createdAt,
      assessmentHash
    };
  }
}
