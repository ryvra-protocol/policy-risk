# Compliance Hooks (provider-agnostic, v1)

## Interfaces

Policy Risk consumes abstract interfaces for:
- KYC/KYB status checks
- sanctions screening
- jurisdiction restrictions

Provider implementation/selection is out of scope for v1.

## Sync vs async checks

- Sync checks: required for immediate hard-fail decisions.
- Async checks: deferred enrichment and retrospective controls where policy allows.

## Timeout and fallback behavior

- Deterministic timeout budgets are configured by policy.
- On timeout, fallback behavior is explicit per rule (`REVIEW` default unless hard safety policy requires `DENY`).
- Fallback outcomes must emit reason codes.

## Audit requirements and reason code mapping

Each compliance hook outcome must be logged with:
- provider-agnostic check type
- normalized status
- mapped reason code(s)
- policy version
- timestamps/latency

No legal compliance guarantees are implied by this layer.
