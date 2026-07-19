import { buildDecision } from "./decision-builder.js";
import { RuleEvaluator } from "./rule-evaluator.js";
import type { PolicyDecision, PolicyInput } from "../types/policy.js";

export interface PolicyEngineConfig {
  policyVersion: string;
  accountDailyLimit: number;
  defaultAssetLimit: number;
}

export class PolicyEngine {
  private readonly evaluator: RuleEvaluator;

  constructor(private readonly config: PolicyEngineConfig, evaluator = new RuleEvaluator()) {
    this.evaluator = evaluator;
  }

  evaluate(input: PolicyInput): PolicyDecision {
    const evaluation = this.evaluator.evaluate(input);

    const decision = evaluation.hardDeny ? "DENY" : evaluation.review ? "REVIEW" : "ALLOW";

    return buildDecision({
      decision,
      policyVersion: this.config.policyVersion,
      appliedRules: evaluation.appliedRules,
      limitsSnapshot: {
        account_daily_limit: this.config.accountDailyLimit,
        asset_limit: this.config.defaultAssetLimit,
        observed_daily_amount: input.velocity_metrics.daily_amount
      },
      expiry: new Date(Date.parse(input.tx_metadata.timestamp) + 5 * 60 * 1000).toISOString()
    });
  }
}
