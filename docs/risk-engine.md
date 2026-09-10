# Risk Engine

## Purpose

The risk engine is independent from the policy evaluator.

Policy produces authority decisions. Risk consumes that policy decision plus deterministic signals to produce a separate assessment record.

## Inputs

- `intent`
- `policyDecision`
- optional `riskSignals`
  - `accountRiskScore`
  - `abuseSignalLevel`
  - `manualFlags`

## Outputs

- `riskAssessmentId`
- `riskTier`
- `score`
- `factors`
- `decision`
- `reasoning`
- `assessmentHash`

## Factor model

The reference implementation uses bounded deterministic factors for:
- transaction amount
- external account risk score
- policy decision severity
- abuse signal level
- mandate linkage
- manual flag count

Each factor records:
- `code`
- `weight`
- `value`
- `reasoning`

## Tier thresholds

- `LOW`: score `< 40`
- `MEDIUM`: score `40-69`
- `HIGH`: score `70-89`
- `CRITICAL`: score `90+`

## Risk decisions

- `APPROVE` for low risk
- `REVIEW` for medium risk
- `ESCALATE` for high risk
- `DENY` for critical risk

## Independence guarantee

- Risk assessment does not mutate the stored policy decision.
- Policy hashes and mandate hashes are copied into the assessment record for linkage only.
- Policy evaluation and risk assessment can be replayed independently from persisted records.
