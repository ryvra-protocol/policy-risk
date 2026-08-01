# Rollback runbook

## Rollback triggers
- Abort threshold met during cutover.
- Critical reconciliation failure.
- Security signal requiring immediate containment.

## Rollback actions
1. Engineering/Ops jointly declare rollback.
2. Revert production routing to prior stable decision path.
3. Validate downstream consumers are receiving fallback behavior.
4. Capture incident timeline and affected request range.
5. Open incident record using template and notify stakeholders.

## Post-rollback validation
- Confirm error rates and reconciliation recover to baseline.
- Confirm no unresolved duplicate/idempotency inconsistencies.
- Freeze further cutover attempts until root cause and remediation are approved.
