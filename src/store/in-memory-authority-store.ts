import type {
  AuditReconstruction,
  CreateMandateVersionInput,
  CreatePolicyVersionInput,
  MandateVersionRecord,
  PolicyDecisionRecord,
  PolicyRecord,
  PolicyRuleRecord,
  PolicyVersionRecord,
  RiskAssessmentRecord
} from "../types/authority.js";
import { parsePolicyDsl } from "../dsl/policy-dsl.js";
import { stableHash } from "../utils/stable-serialization.js";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export class InMemoryAuthorityStore {
  private readonly policyMap = new Map<string, PolicyRecord>();
  private readonly policyVersions = new Map<string, PolicyVersionRecord>();
  private readonly policyRules = new Map<string, PolicyRuleRecord>();
  private readonly mandates = new Map<string, MandateVersionRecord>();
  private readonly policyDecisions = new Map<string, PolicyDecisionRecord>();
  private readonly riskAssessments = new Map<string, RiskAssessmentRecord>();

  createPolicyVersion(input: CreatePolicyVersionInput): PolicyVersionRecord {
    const createdAt = input.createdAt ?? new Date().toISOString();
    const definition = parsePolicyDsl(input.dsl);
    const key = `${input.policyId}:${input.version}`;

    if (this.policyVersions.has(key)) {
      throw new Error(`Policy version already exists: ${key}`);
    }

    const existingPolicy = this.policyMap.get(input.policyId);
    this.policyMap.set(input.policyId, existingPolicy ?? {
      policyId: input.policyId,
      createdAt,
      updatedAt: createdAt
    });

    const record: PolicyVersionRecord = {
      policyId: input.policyId,
      version: input.version,
      status: "DRAFT",
      policyHash: stableHash({ policyId: input.policyId, version: input.version, definition }),
      definition,
      createdAt
    };

    this.policyVersions.set(key, record);
    this.policyMap.set(input.policyId, {
      ...(this.policyMap.get(input.policyId) as PolicyRecord),
      updatedAt: createdAt
    });

    definition.rules.forEach((rule) => {
      const ruleKey = `${key}:${rule.id}`;
      const ruleRecord: PolicyRuleRecord = {
        policyId: input.policyId,
        policyVersion: input.version,
        ruleId: rule.id,
        ruleHash: stableHash({ policyId: input.policyId, policyVersion: input.version, rule }),
        priority: rule.priority,
        decision: rule.decision,
        reasonCode: rule.reasonCode,
        createdAt
      };
      this.policyRules.set(ruleKey, ruleRecord);
    });

    return clone(record);
  }

  activatePolicyVersion(policyId: string, version: string, activatedAt = new Date().toISOString()): PolicyVersionRecord {
    const targetKey = `${policyId}:${version}`;
    const target = this.policyVersions.get(targetKey);

    if (!target) {
      throw new Error(`Unknown policy version: ${targetKey}`);
    }

    for (const [key, value] of this.policyVersions.entries()) {
      if (value.policyId === policyId && value.status === "ACTIVE" && key !== targetKey) {
        this.policyVersions.set(key, { ...value, status: "INACTIVE", deactivatedAt: activatedAt });
      }
    }

    const updated = { ...target, status: "ACTIVE" as const, activatedAt, deactivatedAt: undefined };
    this.policyVersions.set(targetKey, updated);
    return clone(updated);
  }

  deactivatePolicyVersion(policyId: string, version: string, deactivatedAt = new Date().toISOString()): PolicyVersionRecord {
    const key = `${policyId}:${version}`;
    const record = this.policyVersions.get(key);
    if (!record) {
      throw new Error(`Unknown policy version: ${key}`);
    }

    const updated = { ...record, status: "INACTIVE" as const, deactivatedAt };
    this.policyVersions.set(key, updated);
    return clone(updated);
  }

  createMandateVersion(input: CreateMandateVersionInput): MandateVersionRecord {
    const createdAt = input.createdAt ?? new Date().toISOString();
    const definition = parsePolicyDsl(input.dsl);
    const key = `${input.mandateId}:${input.version}`;

    if (this.mandates.has(key)) {
      throw new Error(`Mandate version already exists: ${key}`);
    }

    const record: MandateVersionRecord = {
      mandateId: input.mandateId,
      version: input.version,
      status: "DRAFT",
      mandateHash: stableHash({ mandateId: input.mandateId, version: input.version, definition }),
      definition,
      createdAt
    };

    this.mandates.set(key, record);
    return clone(record);
  }

  activateMandateVersion(mandateId: string, version: string, activatedAt = new Date().toISOString()): MandateVersionRecord {
    const targetKey = `${mandateId}:${version}`;
    const target = this.mandates.get(targetKey);

    if (!target) {
      throw new Error(`Unknown mandate version: ${targetKey}`);
    }

    for (const [key, value] of this.mandates.entries()) {
      if (value.mandateId === mandateId && value.status === "ACTIVE" && key !== targetKey) {
        this.mandates.set(key, { ...value, status: "INACTIVE" });
      }
    }

    const updated = { ...target, status: "ACTIVE" as const, activatedAt, revokedAt: undefined };
    this.mandates.set(targetKey, updated);
    return clone(updated);
  }

  revokeMandateVersion(mandateId: string, version: string, revokedAt = new Date().toISOString()): MandateVersionRecord {
    const key = `${mandateId}:${version}`;
    const record = this.mandates.get(key);
    if (!record) {
      throw new Error(`Unknown mandate version: ${key}`);
    }

    const updated = { ...record, status: "REVOKED" as const, revokedAt };
    this.mandates.set(key, updated);
    return clone(updated);
  }

  savePolicyDecision(record: PolicyDecisionRecord): PolicyDecisionRecord {
    this.policyDecisions.set(record.policyDecisionId, clone(record));
    return clone(record);
  }

  saveRiskAssessment(record: RiskAssessmentRecord): RiskAssessmentRecord {
    this.riskAssessments.set(record.riskAssessmentId, clone(record));
    return clone(record);
  }

  getPolicyVersion(policyId: string, version: string): PolicyVersionRecord | undefined {
    const record = this.policyVersions.get(`${policyId}:${version}`);
    return record ? clone(record) : undefined;
  }

  getMandateVersion(mandateId: string, version: string): MandateVersionRecord | undefined {
    const record = this.mandates.get(`${mandateId}:${version}`);
    return record ? clone(record) : undefined;
  }

  getPolicyDecision(policyDecisionId: string): PolicyDecisionRecord | undefined {
    const record = this.policyDecisions.get(policyDecisionId);
    return record ? clone(record) : undefined;
  }

  getRiskAssessment(riskAssessmentId: string): RiskAssessmentRecord | undefined {
    const record = this.riskAssessments.get(riskAssessmentId);
    return record ? clone(record) : undefined;
  }

  reconstruct(policyDecisionId: string, riskAssessmentId?: string): AuditReconstruction {
    const policyDecision = this.policyDecisions.get(policyDecisionId);
    if (!policyDecision) {
      throw new Error(`Unknown policy decision: ${policyDecisionId}`);
    }

    const policyVersion = this.policyVersions.get(`${policyDecision.policyId}:${policyDecision.policyVersion}`);
    if (!policyVersion) {
      throw new Error(`Unknown persisted policy version for decision: ${policyDecisionId}`);
    }

    const mandateVersion = policyDecision.mandateId && policyDecision.mandateVersion
      ? this.mandates.get(`${policyDecision.mandateId}:${policyDecision.mandateVersion}`)
      : undefined;

    const riskAssessment = riskAssessmentId ? this.riskAssessments.get(riskAssessmentId) : undefined;

    return clone({
      policyDecision,
      policyVersion,
      mandateVersion,
      riskAssessment
    });
  }

  get tables(): {
    policies: PolicyRecord[];
    policy_versions: PolicyVersionRecord[];
    policy_rules: PolicyRuleRecord[];
    mandates: MandateVersionRecord[];
    policy_decisions: PolicyDecisionRecord[];
    risk_assessments: RiskAssessmentRecord[];
  } {
    return {
      policies: [...this.policyMap.values()].map((value) => clone(value)),
      policy_versions: [...this.policyVersions.values()].map((value) => clone(value)),
      policy_rules: [...this.policyRules.values()].map((value) => clone(value)),
      mandates: [...this.mandates.values()].map((value) => clone(value)),
      policy_decisions: [...this.policyDecisions.values()].map((value) => clone(value)),
      risk_assessments: [...this.riskAssessments.values()].map((value) => clone(value))
    };
  }
}
