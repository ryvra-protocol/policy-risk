# Anti-Abuse Policy (v1 baseline)

## Heuristic categories

- Anti-sybil indicators (identity/linkage anomalies, coordinated account behavior)
- Anti-wash indicators (self-trading loops, circular fund movement patterns)

## Risk flags and escalation

- `LOW`: monitor only
- `MEDIUM`: route to `REVIEW`
- `HIGH`: deny eligible transaction classes

Thresholds are **TBD by governance/policy**.

## Impact

### Transaction eligibility
Risk flags feed policy decisions: `ALLOW`, `REVIEW`, or `DENY`.

### PoT points eligibility
Abuse-linked activity can be marked ineligible for PoT rewards.

## Retroactive review and slashing hooks

Expose interface-level hooks to:
- trigger retrospective review
- mark prior rewards/points for slashing review

## False-positive handling and appeals (process outline)

1. User/counterparty submits appeal.
2. Manual or automated secondary review.
3. Deterministic outcome recorded with reason code updates.
4. If overturned, restore eligibility and annotate audit record.
