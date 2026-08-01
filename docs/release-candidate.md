# Release candidate: policy-risk production-readiness alignment

## Scope
This release candidate aligns `policy-risk` governance and operational controls with the protocol-core production-readiness framework, limited to policy decision scope.

## Capabilities
- Deterministic policy decisions with canonical `ALLOW | DENY | REVIEW` outcomes.
- Canonical reason-code normalization and validation behavior.
- Versioned policy outputs via `policy_version`.
- Required-check-ready CI controls and version consistency validation.
- Decision-grade cutover, rollback, and evidence documentation.

## Known limitations
- Staging/runtime evidence is not yet attached in-repo.
- Day-0 monitoring outcomes are pending live execution.
- Remaining non-CI operator evidence/signoff follow-ups are still open and tracked in `docs/cutover-evidence-index.md`.

## Executive verdict
`READY`

## Go/No-Go decision
- Status: `GO` (lead engineer authority).
- CI verification evidence: https://github.com/ryvra-protocol/policy-risk/actions/runs/30687034052
- Required checks aligned: `lint-docs`, `version-consistency`, `typecheck`, `tests`, `dependency-security`.
