# Go/No-Go execution guide

## Roles
- **Eng**: contract/CI verification and implementation owner
- **Ops/SRE**: runtime health, monitoring, rollback execution
- **Security**: threat triage and incident-response readiness
- **Product Owner**: business risk acceptance and final decision call

## Decision workflow
1. Review `docs/cutover-evidence-index.md` completion.
2. Review required-check status and staging scenario outcomes.
3. Evaluate abort-threshold conditions.
4. Record outcome as `GO` or `NO_GO` with rationale.

## Day-0 monitoring window
- Minimum 2 hours active observation.
- Required metrics: decision determinism, deny/review distribution, consumer reconciliation health, error rates.
- Any trigger event escalates to rollback runbook.

## Output
Use `.github/ISSUE_TEMPLATE/go-no-go-cutover.yml` for auditable execution record.

## Current execution-pass outcome
- Final state transition: `READY_PENDING_EVIDENCE` → `READY`.
- Go/No-Go: `GO`.
- Verification run: https://github.com/ryvra-protocol/policy-risk/actions/runs/30687034052
- Required checks confirmed: `lint-docs`, `version-consistency`, `typecheck`, `tests`, `dependency-security`.
