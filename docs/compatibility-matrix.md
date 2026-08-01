# Consumer compatibility matrix

## Production contract
- Decision schema parity: `decision`, `reason_codes`, `policy_version`.
- `decision` values: `ALLOW | DENY | REVIEW`.
- `reason_codes` must be canonical and machine-readable.
- `policy_version` must be explicitly versioned and tracked.

| Consumer | Expected integration mode | Minimum contract assumption | Compatibility status | Notes |
|---|---|---|---|---|
| pay | synchronous pre-authorization check | Handles all three decisions and deny/review reason codes | Compatible (production-verified) | Must enforce deny hard-stop |
| markets | order/risk gate before execution | Preserves review queue path and reason code auditability | Compatible (production-verified) | Review path must not auto-approve |
| ledger-settlement | settlement guardrail and exception path | Deny blocks settlement, review routes to manual/retry controls | Compatible (production-verified) | Reconciliation evidence archived |
| accounts | account-level risk policy enforcement | Consumes policy_version for policy traceability | Compatible (production-verified) | Version drift alarms recommended |
| asset-registry | asset risk restriction checks | Canonical asset-related reason codes preserved | Compatible (production-verified) | Ensure restricted assets map to deny/review policy |

## Upgrade note
Any consumer unable to process `REVIEW` must implement explicit fallback behavior before cutover.
