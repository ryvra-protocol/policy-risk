# Production cutover runbook

## Owners
- Engineering lead
- Ops/SRE lead
- Security lead

## Pre-cutover go/no-go criteria
- All required checks pass.
- Evidence index has no missing critical item.
- Signoff table fully approved.
- Rollback readiness validated.

## Execution steps
1. Confirm target commit hash and required-check statuses.
2. Announce cutover start in designated comms channel.
3. Enable production routing to policy-risk according to environment controls.
4. Start day-0 monitoring window (minimum 2 hours).
5. Track decision rates, deny/review reason-code distribution, and consumer reconciliation.

## Abort thresholds
- Any Sev1 security event.
- Unexplained decision mismatch with consumers above agreed tolerance.
- Idempotency failure causing state divergence.
- Persistent error budget burn beyond on-call policy.

## Communications plan
- T-30 min: readiness announcement.
- T-0: cutover start message.
- T+30/T+60/T+120: monitoring updates.
- End of window: go-forward or rollback statement with evidence links.
