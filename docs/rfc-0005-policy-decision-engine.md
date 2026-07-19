# RFC-0005: Policy Decision Engine (v1)

## Scope

Defines the v1 deterministic policy decision contract for Ryvra Policy Risk.

## Decision contract

Every policy decision returns:
- `decision`: `ALLOW | DENY | REVIEW`
- `reason_codes`: machine-readable reason code list
- `policy_version`: required on every decision

## Input schema (v1)

- `account_profile`
  - account id
  - account type/risk tier
  - KYC/KYB state
- `tx_metadata`
  - transaction id
  - amount
  - tx type
  - timestamp
- `asset_attributes`
  - asset id/symbol
  - volatility/risk class hints
- `jurisdiction_context`
  - origin/destination jurisdictions
  - restriction tags
- `velocity_metrics`
  - daily/epoch counts and amounts

## Output schema (v1)

- `decision`
- `reason_codes`
- `applied_rules`
- `limits_snapshot`
- `expiry`
- `policy_version`

## Deterministic evaluation

Given identical normalized inputs and the same `policy_version`, evaluation MUST return identical outputs.

## Rule precedence and conflict resolution

1. Hard deny rules (sanctions/restrictions/abuse hard-fail) win first.
2. Then hard limit violations.
3. Then review-triggering rules.
4. Otherwise allow.

If multiple rules match at the same precedence, preserve deterministic ordering by sorted rule identifier.

## Emergency override and safe mode

- `safe_mode` may force `REVIEW` or `DENY` for configured transaction classes.
- Emergency override actions MUST be auditable with explicit reason codes and operator metadata in external audit systems.

## Idempotency and replay handling

- The decision API must accept an idempotency key.
- Replays with the same key and unchanged canonical input must return the same decision payload.
- Replay mismatches (same key, different canonical input hash) must return a deterministic conflict result in the caller contract.
