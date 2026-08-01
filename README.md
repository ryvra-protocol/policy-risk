# Ryvra Policy Risk

Ryvra Policy Risk is the protocol decision layer for deterministic transaction policy decisions.

It acts as a policy decision point for:
- transaction authorization
- risk scoring and limit enforcement
- compliance hook orchestration
- anti-abuse and reward-eligibility decisions

**Status: production-ready**

## Canonical decision schema

Every decision output includes:
- `decision`: `ALLOW | DENY | REVIEW`
- `reason_codes`: `string[]`
- `policy_version`: `string`

Rules:
- `DENY` must include at least one machine-readable reason code.
- `ALLOW` and `REVIEW` may use an empty `reason_codes` array when policy logic permits.
- Reason code prefixes must be canonical:
  - `LIMIT_EXCEEDED_*`
  - `VELOCITY_EXCEEDED_*`
  - `JURISDICTION_RESTRICTED_*`
  - `SANCTIONS_HIT_*`
  - `RISK_SCORE_HIGH_*`
  - `DUPLICATE_REFERENCE_*`
  - `ASSET_RESTRICTED_*`

## Architecture

`input context -> policy engine -> decision + reason codes -> audit log`

The implementation is docs-first and interface-first, with production decision contracts and controls documented in `/docs`.

## Consumers

- accounts
- pay
- markets
- ledger-settlement
- PoT engine
