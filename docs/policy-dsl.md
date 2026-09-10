# Policy DSL

## Format

The policy DSL accepts either JSON or YAML and is parsed into a deterministic rule set.

Required top-level fields:
- `version`: `v<major>[.<minor>[.<patch>]]`
- `defaultDecision`: `ALLOW | DENY | REVIEW | CHALLENGE | DELAY | QUARANTINE`
- `rules`: array

## Rule schema

Each rule contains:
- `id`: unique string identifier
- `priority`: finite number
- `decision`: one of the supported decisions
- `reasonCode`: required for every non-`ALLOW` rule
- `description`: optional string
- `conditions`: object containing `all`, `any`, or both

Condition schema:
- `fact`: dot-path into the normalized intent
- `operator`: `EQUALS | NOT_EQUALS | GT | GTE | LT | LTE | IN | NOT_IN | CONTAINS`
- `value`: scalar or array depending on the operator

## Evaluation model

- Every rule is evaluated against the same normalized intent.
- `all` conditions must all match.
- `any` conditions require at least one match.
- A rule with both `all` and `any` matches only when both groups succeed.

## Decision precedence

The evaluator uses the following deterministic precedence:
1. `DENY`
2. `QUARANTINE`
3. `CHALLENGE`
4. `DELAY`
5. `REVIEW`
6. `ALLOW`

Tie-break order:
1. stronger decision precedence
2. mandate source before policy source
3. higher numeric `priority`
4. lexical `rule.id`

## Example YAML

```yaml
version: v1.0.0
defaultDecision: ALLOW
rules:
  - id: deny_restricted
    priority: 100
    decision: DENY
    reasonCode: JURISDICTION_RESTRICTED_DESTINATION
    conditions:
      all:
        - fact: jurisdiction_context.restricted
          operator: EQUALS
          value: true
  - id: challenge_large_transfer
    priority: 50
    decision: CHALLENGE
    reasonCode: RISK_SCORE_HIGH_CHALLENGE_REQUIRED
    conditions:
      all:
        - fact: tx_metadata.amount
          operator: GTE
          value: 1000
```

## Determinism constraints

- No implicit ordering from object keys is used.
- Stable serialization is applied before hashing stored versions.
- Matching results are explicitly sorted before a decision is chosen.
- Invalid DSL documents are rejected before persistence or activation.
