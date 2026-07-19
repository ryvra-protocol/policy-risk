import type { PolicyInput } from "../types/policy.js";

export interface RuleEvaluation {
  appliedRules: string[];
  hardDeny: boolean;
  review: boolean;
  riskScore: number;
}

export class RuleEvaluator {
  evaluate(input: PolicyInput): RuleEvaluation {
    const appliedRules: string[] = [];

    const txAmountFactor = input.tx_metadata.amount > 1_000 ? 40 : 10;
    const velocityFactor = input.velocity_metrics.daily_amount > 5_000 ? 40 : 10;
    const accountFactor = input.account_profile.risk_tier === "HIGH" ? 30 : input.account_profile.risk_tier === "MEDIUM" ? 20 : 5;
    const jurisdictionFactor = input.jurisdiction_context.restricted ? 30 : 0;

    const riskScore = txAmountFactor + velocityFactor + accountFactor + jurisdictionFactor;

    if (input.jurisdiction_context.restricted) {
      appliedRules.push("jurisdiction.restricted.hard_deny");
    }

    if (input.velocity_metrics.daily_amount > 10_000) {
      appliedRules.push("limits.account_daily.exceeded");
    }

    if (riskScore >= 80) {
      appliedRules.push("risk.score.high");
    } else if (riskScore >= 60) {
      appliedRules.push("risk.score.borderline");
    }

    return {
      appliedRules: appliedRules.sort(),
      hardDeny: input.jurisdiction_context.restricted || input.velocity_metrics.daily_amount > 10_000 || riskScore >= 80,
      review: riskScore >= 60 && riskScore < 80,
      riskScore
    };
  }
}
