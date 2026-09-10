import type { PolicyInput } from "./policy.js";

export type AuthorityRecordStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "REVOKED";
export type ProgrammablePolicyDecision = "ALLOW" | "DENY" | "REVIEW" | "CHALLENGE" | "DELAY" | "QUARANTINE";
export type RiskTier = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type RiskDecision = "APPROVE" | "DENY" | "ESCALATE" | "REVIEW";
export type RuleOperator = "EQUALS" | "NOT_EQUALS" | "GT" | "GTE" | "LT" | "LTE" | "IN" | "NOT_IN" | "CONTAINS";

export interface PolicyRuleCondition {
  fact: string;
  operator: RuleOperator;
  value: string | number | boolean | Array<string | number | boolean>;
}

export interface PolicyRuleConditionGroup {
  all?: PolicyRuleCondition[];
  any?: PolicyRuleCondition[];
}

export interface PolicyDslRule {
  id: string;
  priority: number;
  decision: ProgrammablePolicyDecision;
  reasonCode?: string;
  description?: string;
  conditions: PolicyRuleConditionGroup;
}

export interface PolicyDslDefinition {
  version: string;
  defaultDecision: ProgrammablePolicyDecision;
  rules: PolicyDslRule[];
}

export interface PolicyRecord {
  policyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyVersionRecord {
  policyId: string;
  version: string;
  status: AuthorityRecordStatus;
  policyHash: string;
  definition: PolicyDslDefinition;
  createdAt: string;
  activatedAt?: string;
  deactivatedAt?: string;
}

export interface PolicyRuleRecord {
  policyId: string;
  policyVersion: string;
  ruleId: string;
  ruleHash: string;
  priority: number;
  decision: ProgrammablePolicyDecision;
  reasonCode?: string;
  createdAt: string;
}

export interface MandateVersionRecord {
  mandateId: string;
  version: string;
  status: AuthorityRecordStatus;
  mandateHash: string;
  definition: PolicyDslDefinition;
  createdAt: string;
  activatedAt?: string;
  revokedAt?: string;
}

export interface EvaluatedRuleMatch {
  source: "policy" | "mandate";
  sourceId: string;
  sourceVersion: string;
  ruleId: string;
  decision: ProgrammablePolicyDecision;
  reasonCode?: string;
  priority: number;
  evaluationIndex: number;
}

export interface PolicyDecisionRecord {
  policyDecisionId: string;
  intentId: string;
  mandateId?: string;
  mandateVersion?: string;
  mandateHash?: string;
  policyId: string;
  policyVersion: string;
  policyHash: string;
  decision: ProgrammablePolicyDecision;
  reasonCodes: string[];
  matchedRules: EvaluatedRuleMatch[];
  createdAt: string;
  inputHash: string;
  decisionHash: string;
}

export interface RiskFactor {
  code: string;
  weight: number;
  value: string | number | boolean;
  reasoning: string;
}

export interface RiskSignalContext {
  accountRiskScore?: number;
  abuseSignalLevel?: "LOW" | "MEDIUM" | "HIGH";
  manualFlags?: string[];
}

export interface RiskAssessmentRecord {
  riskAssessmentId: string;
  intentId: string;
  mandateId?: string;
  mandateHash?: string;
  policyDecisionId: string;
  policyHash: string;
  riskTier: RiskTier;
  score: number;
  factors: RiskFactor[];
  decision: RiskDecision;
  reasoning: string;
  createdAt: string;
  assessmentHash: string;
}

export interface CreatePolicyVersionInput {
  policyId: string;
  version: string;
  dsl: PolicyDslDefinition | string;
  createdAt?: string;
}

export interface CreateMandateVersionInput {
  mandateId: string;
  version: string;
  dsl: PolicyDslDefinition | string;
  createdAt?: string;
}

export interface EvaluatePolicyInput {
  intent: PolicyInput;
  policyId: string;
  policyVersion: string;
  mandateId?: string;
  mandateVersion?: string;
  createdAt?: string;
}

export interface AssessRiskInput {
  intent: PolicyInput;
  policyDecision: PolicyDecisionRecord;
  riskSignals?: RiskSignalContext;
  createdAt?: string;
}

export interface AuditReconstruction {
  policyDecision: PolicyDecisionRecord;
  policyVersion: PolicyVersionRecord;
  mandateVersion?: MandateVersionRecord;
  riskAssessment?: RiskAssessmentRecord;
}
