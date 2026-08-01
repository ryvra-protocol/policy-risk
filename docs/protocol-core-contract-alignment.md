# Protocol-core contract alignment (policy-risk)

## Decision schema parity
`policy-risk` maintains parity with protocol-core canonical output contract:
- `decision`: enum `ALLOW | DENY | REVIEW`
- `reason_codes`: canonical machine-readable strings
- `policy_version`: explicit policy contract version

## Reason-code canonicality expectations
- Only canonical prefixes are valid:
  - `LIMIT_EXCEEDED_*`
  - `VELOCITY_EXCEEDED_*`
  - `JURISDICTION_RESTRICTED_*`
  - `SANCTIONS_HIT_*`
  - `RISK_SCORE_HIGH_*`
  - `DUPLICATE_REFERENCE_*`
  - `ASSET_RESTRICTED_*`
- Legacy/non-canonical codes must be normalized or rejected before release consumers depend on them.

## policy_version versioning guidance
- Use semver-compatible policy contract identifiers.
- Current accepted internal pattern in code artifacts: `v<major>` or `v<major>.<minor>.<patch>`.
- Breaking contract changes require major version increment.
- Backward-compatible reason-code additions require minor increment.
- Non-contract fixes may use patch increment.

## Breaking-change policy
- Breaking change definition:
  - Removing/renaming a `decision` value.
  - Changing meaning of existing canonical `reason_codes`.
  - Contract shape changes for `policy_version`, `reason_codes`, or `decision`.
- Required path:
  1. RFC/proposal update.
  2. Consumer impact analysis in compatibility matrix.
  3. Major version bump and migration notice.
  4. Parallel rollout window with dual-readiness verification.

## Consumer upgrade path notes
- `pay`, `markets`, `ledger-settlement`, `accounts`, `asset-registry` must validate parser compatibility before promoting a new major `policy_version`.
- Use staged rollout: canary consumer, reconciliation verification, then full enablement.
