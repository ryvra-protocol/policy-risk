import type { EvaluatedRuleMatch, PolicyDslDefinition, PolicyRuleCondition, PolicyRuleConditionGroup, ProgrammablePolicyDecision } from "../types/authority.js";
import type { PolicyInput } from "../types/policy.js";
import { normalizeReasonCodes } from "../types/reason-codes.js";

const DECISION_PRECEDENCE: Record<ProgrammablePolicyDecision, number> = {
  DENY: 6,
  QUARANTINE: 5,
  CHALLENGE: 4,
  DELAY: 3,
  REVIEW: 2,
  ALLOW: 1
};

function getFactValue(intent: PolicyInput, fact: string): unknown {
  return fact.split(".").reduce<unknown>((current, segment) => {
    if (!current || typeof current !== "object") {
      return undefined;
    }

    return (current as Record<string, unknown>)[segment];
  }, intent);
}

function matchesCondition(intent: PolicyInput, condition: PolicyRuleCondition): boolean {
  const actualValue = getFactValue(intent, condition.fact);
  const expectedValue = condition.value;

  switch (condition.operator) {
    case "EQUALS":
      return actualValue === expectedValue;
    case "NOT_EQUALS":
      return actualValue !== expectedValue;
    case "GT":
      return typeof actualValue === "number" && typeof expectedValue === "number" && actualValue > expectedValue;
    case "GTE":
      return typeof actualValue === "number" && typeof expectedValue === "number" && actualValue >= expectedValue;
    case "LT":
      return typeof actualValue === "number" && typeof expectedValue === "number" && actualValue < expectedValue;
    case "LTE":
      return typeof actualValue === "number" && typeof expectedValue === "number" && actualValue <= expectedValue;
    case "IN":
      return Array.isArray(expectedValue) && expectedValue.includes(actualValue as never);
    case "NOT_IN":
      return Array.isArray(expectedValue) && !expectedValue.includes(actualValue as never);
    case "CONTAINS":
      if (Array.isArray(actualValue)) {
        return actualValue.includes(expectedValue as never);
      }
      return typeof actualValue === "string" && typeof expectedValue === "string" && actualValue.includes(expectedValue);
    default:
      return false;
  }
}

function matchesGroup(intent: PolicyInput, conditions: PolicyRuleConditionGroup): boolean {
  const allMatch = !conditions.all || conditions.all.every((condition) => matchesCondition(intent, condition));
  const anyMatch = !conditions.any || conditions.any.some((condition) => matchesCondition(intent, condition));
  return allMatch && anyMatch;
}

export function compareRuleMatches(left: EvaluatedRuleMatch, right: EvaluatedRuleMatch): number {
  const decisionDifference = DECISION_PRECEDENCE[right.decision] - DECISION_PRECEDENCE[left.decision];
  if (decisionDifference !== 0) {
    return decisionDifference;
  }

  if (left.source !== right.source) {
    return left.source === "mandate" ? -1 : 1;
  }

  const priorityDifference = right.priority - left.priority;
  if (priorityDifference !== 0) {
    return priorityDifference;
  }

  const sourceDifference = left.sourceId.localeCompare(right.sourceId);
  if (sourceDifference !== 0) {
    return sourceDifference;
  }

  return left.ruleId.localeCompare(right.ruleId);
}

export function compareDecisions(left: ProgrammablePolicyDecision, right: ProgrammablePolicyDecision): number {
  return DECISION_PRECEDENCE[right] - DECISION_PRECEDENCE[left];
}

export interface RuleSetEvaluation {
  decision: ProgrammablePolicyDecision;
  matchedRules: EvaluatedRuleMatch[];
  winningRules: EvaluatedRuleMatch[];
  reasonCodes: string[];
}

export class DeterministicPolicyEvaluator {
  evaluate(input: {
    definition: PolicyDslDefinition;
    intent: PolicyInput;
    source: "policy" | "mandate";
    sourceId: string;
    sourceVersion: string;
  }): RuleSetEvaluation {
    const matchedRules = input.definition.rules
      .filter((rule) => matchesGroup(input.intent, rule.conditions))
      .map<EvaluatedRuleMatch>((rule, index) => ({
        source: input.source,
        sourceId: input.sourceId,
        sourceVersion: input.sourceVersion,
        ruleId: rule.id,
        decision: rule.decision,
        reasonCode: rule.reasonCode,
        priority: rule.priority,
        evaluationIndex: index
      }))
      .sort(compareRuleMatches);

    const decision = matchedRules[0]?.decision ?? input.definition.defaultDecision;
    const winningRules = matchedRules.filter((rule) => rule.decision === decision);
    const reasonCodes = decision === "ALLOW"
      ? []
      : normalizeReasonCodes(winningRules.flatMap((rule) => rule.reasonCode ? [rule.reasonCode] : []));

    return {
      decision,
      matchedRules,
      winningRules,
      reasonCodes
    };
  }
}
