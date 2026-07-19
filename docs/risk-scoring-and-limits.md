# Risk Scoring and Limits (v1 baseline)

## Baseline risk scoring model

Placeholder deterministic score:

`risk_score = base_account_risk + tx_size_factor + velocity_factor + jurisdiction_factor + abuse_signal_factor`

All thresholds/weights are **TBD by governance/policy**.

## Limits

- Per-account limits: daily/epoch amount and count ceilings.
- Per-asset limits: asset-specific amount ceilings and optional deny classes.
- Limit snapshots are included in decision output for auditability.

## Velocity controls

- Daily and epoch windows are evaluated deterministically.
- Window definitions and thresholds are **TBD by governance/policy**.

## Session key constraints integration

Session key constraints can cap tx type, asset, amount, and validity window. Violations should map to deterministic reason codes.

## Examples

### Approved low-risk payment
- small transfer
- verified account
- low velocity
- no restrictions
- Result: `ALLOW`

### Denied high-risk transfer
- high amount + high velocity + restricted jurisdiction or sanctions hit
- Result: `DENY`

### Review-required borderline case
- medium risk near threshold, no hard deny
- Result: `REVIEW`
