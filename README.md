# Ryvra Policy Risk

Ryvra Policy Risk is the protocol decision layer for deterministic transaction policy and independent risk decisions.

It acts as a policy decision point for:
- transaction authorization
- risk scoring and limit enforcement
- compliance hook orchestration
- anti-abuse and reward-eligibility decisions

**Status: early draft / not production-ready**

## Deterministic programmable authority

This repository now includes a reference implementation for deterministic programmable authority:
- versioned policies and mandates with immutable active versions
- stable hashing for policy, mandate, decision, and risk records
- a deterministic JSON/YAML policy DSL with explicit reason codes
- an independent risk engine that consumes policy output but never mutates it
- reconstructable audit records persisted in the in-memory reference store

## Canonical decision schema

Every policy decision output includes:
- `decision`: `ALLOW | DENY | REVIEW | CHALLENGE | DELAY | QUARANTINE`
- `reason_codes`: `string[]`
- `policy_version`: `string`

Rules:
- `ALLOW` may use an empty `reason_codes` array.
- `DENY`, `REVIEW`, `CHALLENGE`, `DELAY`, and `QUARANTINE` must include one or more machine-readable reason codes.
- Reason code prefixes must be canonical:
  - `LIMIT_EXCEEDED_*`
  - `VELOCITY_EXCEEDED_*`
  - `JURISDICTION_RESTRICTED_*`
  - `SANCTIONS_HIT_*`
  - `RISK_SCORE_HIGH_*`
  - `DUPLICATE_REFERENCE_*`
  - `ASSET_RESTRICTED_*`

## Policy DSL

The deterministic DSL accepts JSON or YAML.

Top-level fields:
- `version`
- `defaultDecision`
- `rules[]`

Each rule includes:
- `id`
- `priority`
- `decision`
- `reasonCode` for every non-`ALLOW` rule
- `conditions.all` and/or `conditions.any`

Supported operators:
- `EQUALS`
- `NOT_EQUALS`
- `GT`
- `GTE`
- `LT`
- `LTE`
- `IN`
- `NOT_IN`
- `CONTAINS`

See `/home/runner/work/policy-risk/policy-risk/docs/policy-dsl.md` for the full DSL reference.

## Decision semantics

Safety precedence is deterministic and explicit:
1. `DENY`
2. `QUARANTINE`
3. `CHALLENGE`
4. `DELAY`
5. `REVIEW`
6. `ALLOW`

Tie-breaks are deterministic:
1. stronger decision precedence wins
2. mandate matches outrank policy matches at the same decision level
3. higher numeric rule priority wins inside the same source and decision
4. lexical `rule.id` order breaks any remaining ties

## Risk model and tiers

Risk is evaluated independently from policy.

Inputs:
- `intent`
- `policyDecision`
- optional risk signals such as `accountRiskScore`, `abuseSignalLevel`, and `manualFlags`

Outputs:
- `riskAssessmentId`
- `riskTier`: `LOW | MEDIUM | HIGH | CRITICAL`
- `score`
- `factors`
- `decision`: `APPROVE | REVIEW | ESCALATE | DENY`
- `reasoning`

Tier thresholds:
- `LOW`: `< 40`
- `MEDIUM`: `40-69`
- `HIGH`: `70-89`
- `CRITICAL`: `90+`

See `/home/runner/work/policy-risk/policy-risk/docs/risk-engine.md` for the factor model.

## Versioning and immutability

- Policies are stored in `policies`, `policy_versions`, and `policy_rules`.
- Mandates are stored as versioned `mandates` rows.
- Active versions are immutable because the implementation only supports creating new versions and activating/deactivating or revoking versions.
- Stable serialization is used before hashing policy, mandate, decision, and risk records.
- The reference SQL migration is at `/home/runner/work/policy-risk/policy-risk/migrations/001_deterministic_programmable_authority.sql`.

## Auditability

Every persisted policy decision stores:
- matched rules
- reason codes
- policy version and `policyHash`
- mandate version and `mandateHash` when present
- deterministic `inputHash`
- deterministic `decisionHash`

Every persisted risk assessment stores:
- `policyDecisionId`
- `policyHash`
- optional mandate linkage
- structured factors
- deterministic `assessmentHash`

These records can be replayed and reconstructed with `DeterministicAuthorityService.reconstructDecision(...)`.

## Services

Reference service methods:
- `createPolicyVersion`
- `activatePolicyVersion`
- `deactivatePolicyVersion`
- `createMandateVersion`
- `activateMandateVersion`
- `revokeMandateVersion`
- `evaluatePolicy`
- `assessRisk`
- `reconstructDecision`

## Architecture

`intent -> policy + mandate evaluation -> policy decision -> independent risk assessment -> audit reconstruction`

The baseline remains provider-agnostic. Provider integrations are still abstract in v1.

## Consumers

- accounts
- pay
- markets
- ledger-settlement
- PoT engine
