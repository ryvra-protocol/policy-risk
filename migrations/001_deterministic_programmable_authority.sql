CREATE TABLE policies (
  policy_id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE policy_versions (
  policy_id TEXT NOT NULL REFERENCES policies(policy_id),
  version TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('DRAFT', 'ACTIVE', 'INACTIVE', 'REVOKED')),
  policy_hash TEXT NOT NULL,
  definition_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  activated_at TEXT,
  deactivated_at TEXT,
  PRIMARY KEY (policy_id, version)
);

CREATE UNIQUE INDEX policy_versions_single_active
  ON policy_versions(policy_id)
  WHERE status = 'ACTIVE';

CREATE INDEX policy_versions_lookup_idx
  ON policy_versions(policy_id, version, created_at);

CREATE TABLE policy_rules (
  policy_id TEXT NOT NULL,
  policy_version TEXT NOT NULL,
  rule_id TEXT NOT NULL,
  rule_hash TEXT NOT NULL,
  priority INTEGER NOT NULL,
  decision TEXT NOT NULL,
  reason_code TEXT,
  created_at TEXT NOT NULL,
  PRIMARY KEY (policy_id, policy_version, rule_id),
  FOREIGN KEY (policy_id, policy_version) REFERENCES policy_versions(policy_id, version)
);

CREATE INDEX policy_rules_lookup_idx
  ON policy_rules(policy_id, policy_version, created_at);

CREATE TABLE mandates (
  mandate_id TEXT NOT NULL,
  version TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('DRAFT', 'ACTIVE', 'INACTIVE', 'REVOKED')),
  mandate_hash TEXT NOT NULL,
  definition_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  activated_at TEXT,
  revoked_at TEXT,
  PRIMARY KEY (mandate_id, version)
);

CREATE UNIQUE INDEX mandates_single_active
  ON mandates(mandate_id)
  WHERE status = 'ACTIVE';

CREATE INDEX mandates_lookup_idx
  ON mandates(mandate_id, version, created_at);

CREATE TABLE policy_decisions (
  policy_decision_id TEXT PRIMARY KEY,
  intent_id TEXT NOT NULL,
  mandate_id TEXT,
  mandate_version TEXT,
  mandate_hash TEXT,
  policy_id TEXT NOT NULL,
  policy_version TEXT NOT NULL,
  policy_hash TEXT NOT NULL,
  decision TEXT NOT NULL,
  reason_codes_json TEXT NOT NULL,
  matched_rules_json TEXT NOT NULL,
  input_hash TEXT NOT NULL,
  decision_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (policy_id, policy_version) REFERENCES policy_versions(policy_id, version),
  FOREIGN KEY (mandate_id, mandate_version) REFERENCES mandates(mandate_id, version)
);

CREATE INDEX policy_decisions_audit_idx
  ON policy_decisions(intent_id, mandate_id, policy_version, created_at);

CREATE TABLE risk_assessments (
  risk_assessment_id TEXT PRIMARY KEY,
  intent_id TEXT NOT NULL,
  mandate_id TEXT,
  mandate_hash TEXT,
  policy_decision_id TEXT NOT NULL REFERENCES policy_decisions(policy_decision_id),
  policy_hash TEXT NOT NULL,
  risk_tier TEXT NOT NULL CHECK (risk_tier IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  score INTEGER NOT NULL,
  factors_json TEXT NOT NULL,
  decision TEXT NOT NULL,
  reasoning TEXT NOT NULL,
  assessment_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX risk_assessments_audit_idx
  ON risk_assessments(intent_id, mandate_id, created_at);
