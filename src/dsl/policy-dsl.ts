import YAML from "yaml";

import type { PolicyDslDefinition, PolicyDslRule, PolicyRuleCondition, ProgrammablePolicyDecision, RuleOperator } from "../types/authority.js";
import { isCanonicalReasonCode, normalizeReasonCode } from "../types/reason-codes.js";

const VALID_DECISIONS: ProgrammablePolicyDecision[] = ["ALLOW", "DENY", "REVIEW", "CHALLENGE", "DELAY", "QUARANTINE"];
const VALID_OPERATORS: RuleOperator[] = ["EQUALS", "NOT_EQUALS", "GT", "GTE", "LT", "LTE", "IN", "NOT_IN", "CONTAINS"];

export interface PolicyDslValidationResult {
  valid: boolean;
  errors: string[];
  value?: PolicyDslDefinition;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeCondition(condition: PolicyRuleCondition): PolicyRuleCondition {
  return {
    fact: condition.fact,
    operator: condition.operator,
    value: Array.isArray(condition.value) ? [...condition.value] : condition.value
  };
}

function normalizeRule(rule: PolicyDslRule): PolicyDslRule {
  return {
    id: rule.id,
    priority: rule.priority,
    decision: rule.decision,
    reasonCode: rule.reasonCode ? normalizeReasonCode(rule.reasonCode) : undefined,
    description: rule.description,
    conditions: {
      all: rule.conditions.all?.map((condition) => normalizeCondition(condition)),
      any: rule.conditions.any?.map((condition) => normalizeCondition(condition))
    }
  };
}

export function validatePolicyDsl(input: PolicyDslDefinition | string): PolicyDslValidationResult {
  const errors: string[] = [];
  let parsed: unknown = input;

  if (typeof input === "string") {
    try {
      parsed = YAML.parse(input);
    } catch (error) {
      return {
        valid: false,
        errors: [error instanceof Error ? error.message : "Unable to parse policy DSL"]
      };
    }
  }

  if (!isObject(parsed)) {
    return {
      valid: false,
      errors: ["policy DSL must be an object"]
    };
  }

  const version = parsed.version;
  const defaultDecision = parsed.defaultDecision;
  const rules = parsed.rules;

  if (typeof version !== "string" || !/^v\d+(?:\.\d+){0,2}$/.test(version)) {
    errors.push("version must match v<major>[.<minor>[.<patch>]]");
  }

  if (typeof defaultDecision !== "string" || !VALID_DECISIONS.includes(defaultDecision as ProgrammablePolicyDecision)) {
    errors.push(`defaultDecision must be one of ${VALID_DECISIONS.join(", ")}`);
  }

  if (!Array.isArray(rules)) {
    errors.push("rules must be an array");
  }

  const normalizedRules: PolicyDslRule[] = [];

  if (Array.isArray(rules)) {
    const seenRuleIds = new Set<string>();

    rules.forEach((rule, index) => {
      if (!isObject(rule)) {
        errors.push(`rules[${index}] must be an object`);
        return;
      }

      const id = rule.id;
      const priority = rule.priority;
      const decision = rule.decision;
      const reasonCode = rule.reasonCode;
      const description = rule.description;
      const conditions = rule.conditions;

      if (typeof id !== "string" || id.trim().length === 0) {
        errors.push(`rules[${index}].id must be a non-empty string`);
      } else if (seenRuleIds.has(id)) {
        errors.push(`rules[${index}].id must be unique`);
      } else {
        seenRuleIds.add(id);
      }

      if (typeof priority !== "number" || !Number.isFinite(priority)) {
        errors.push(`rules[${index}].priority must be a finite number`);
      }

      if (typeof decision !== "string" || !VALID_DECISIONS.includes(decision as ProgrammablePolicyDecision)) {
        errors.push(`rules[${index}].decision must be one of ${VALID_DECISIONS.join(", ")}`);
      }

      if (description !== undefined && typeof description !== "string") {
        errors.push(`rules[${index}].description must be a string when present`);
      }

      if (!["ALLOW"].includes(String(decision)) && typeof reasonCode !== "string") {
        errors.push(`rules[${index}].reasonCode must be provided for non-ALLOW decisions`);
      }

      if (typeof reasonCode === "string" && !isCanonicalReasonCode(normalizeReasonCode(reasonCode))) {
        errors.push(`rules[${index}].reasonCode must use a canonical reason code prefix`);
      }

      if (!isObject(conditions)) {
        errors.push(`rules[${index}].conditions must be an object`);
        return;
      }

      const all = conditions.all;
      const any = conditions.any;
      if (!Array.isArray(all) && !Array.isArray(any)) {
        errors.push(`rules[${index}].conditions must define all, any, or both`);
      }

      const validateConditionList = (label: "all" | "any", list: unknown) => {
        if (list === undefined) {
          return [] as PolicyRuleCondition[];
        }

        if (!Array.isArray(list)) {
          errors.push(`rules[${index}].conditions.${label} must be an array`);
          return [] as PolicyRuleCondition[];
        }

        return list.flatMap((condition, conditionIndex) => {
          if (!isObject(condition)) {
            errors.push(`rules[${index}].conditions.${label}[${conditionIndex}] must be an object`);
            return [];
          }

          const fact = condition.fact;
          const operator = condition.operator;
          const value = condition.value;

          if (typeof fact !== "string" || fact.trim().length === 0) {
            errors.push(`rules[${index}].conditions.${label}[${conditionIndex}].fact must be a non-empty string`);
          }

          if (typeof operator !== "string" || !VALID_OPERATORS.includes(operator as RuleOperator)) {
            errors.push(`rules[${index}].conditions.${label}[${conditionIndex}].operator must be one of ${VALID_OPERATORS.join(", ")}`);
          }

          if (value === undefined) {
            errors.push(`rules[${index}].conditions.${label}[${conditionIndex}].value must be present`);
          }

          return [{ fact: String(fact), operator: operator as RuleOperator, value: value as PolicyRuleCondition["value"] }];
        });
      };

      const normalizedAll = validateConditionList("all", all);
      const normalizedAny = validateConditionList("any", any);

      if (errors.length === 0 || (typeof id === "string" && typeof priority === "number" && typeof decision === "string")) {
        normalizedRules.push(normalizeRule({
          id: String(id),
          priority: Number(priority),
          decision: decision as ProgrammablePolicyDecision,
          reasonCode: typeof reasonCode === "string" ? reasonCode : undefined,
          description: typeof description === "string" ? description : undefined,
          conditions: {
            all: normalizedAll.length > 0 ? normalizedAll : undefined,
            any: normalizedAny.length > 0 ? normalizedAny : undefined
          }
        }));
      }
    });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors,
    value: {
      version: version as string,
      defaultDecision: defaultDecision as ProgrammablePolicyDecision,
      rules: normalizedRules
    }
  };
}

export function parsePolicyDsl(input: PolicyDslDefinition | string): PolicyDslDefinition {
  const validation = validatePolicyDsl(input);
  if (!validation.valid || !validation.value) {
    throw new Error(`Invalid policy DSL: ${validation.errors.join("; ")}`);
  }

  return validation.value;
}
