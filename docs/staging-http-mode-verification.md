# Staging HTTP mode verification

## Objective
Collect evidence that policy-risk behavior is deterministic, safe, and consumer-compatible before production cutover.

## Environment contract
If executable staging tests are run outside this repo, operators must provide:
- `POLICY_RISK_BASE_URL`
- `POLICY_RISK_AUTH_TOKEN` (if required)
- `STAGING_CONSUMER_CALLBACK_MODE` (or equivalent routing mode)
- `TRACE_RUN_ID` for evidence traceability

## Required scenarios
1. **Decision determinism under retry**
   - Re-submit identical payload N times.
   - Expected: same `decision`, `reason_codes`, and `policy_version`.
2. **Duplicate request idempotency**
   - Re-send same request ID with retry/backoff.
   - Expected: no conflicting downstream state.
3. **Late/out-of-order event safety**
   - Submit reordered event sequence for same entity.
   - Expected: safe handling with no unauthorized allow-path transitions.
4. **Deny-path reason code completeness**
   - Trigger deny scenarios.
   - Expected: non-empty canonical `reason_codes` for each deny.
5. **Downstream reconciliation**
   - Compare policy outcomes versus pay/markets/ledger-settlement/accounts/asset-registry consumption logs.
   - Expected: no unresolved mismatch at close of run.

## Evidence capture
Attach links/screenshots/log snippets to `docs/cutover-evidence-index.md` and go/no-go issue.
