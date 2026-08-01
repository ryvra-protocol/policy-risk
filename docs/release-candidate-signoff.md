# Release candidate signoff

| Role | Owner | Status | Required evidence | Notes |
|---|---|---|---|---|
| Core Engineering | Lead engineer | APPROVED | CI green (`lint-docs`, `version-consistency`, `typecheck`, `tests`) and contract docs reviewed | Approved with run https://github.com/ryvra-protocol/policy-risk/actions/runs/30687034052 |
| Ops/SRE | Ops/SRE on-call | PENDING | Staging verification evidence and cutover/rollback dry run | Owner: Ops/SRE on-call; ETA: 2026-08-02 UTC |
| Security | Security lead | PARTIAL | `dependency-security` outcome, security triage review, incident readiness | `dependency-security` COMPLETE in CI run; incident-readiness acknowledgment pending (ETA: 2026-08-02 UTC) |
| Product Owner | Product owner | PENDING | Go/no-go checklist completion and risk acceptance | Owner: Product owner; action: publish issue record from template; ETA: next go/no-go sync (2026-08-02 UTC) |

## Signoff rule
Lead engineer may issue final execution-pass `READY`/`GO` once required CI checks are verified; remaining non-CI/operator tasks stay tracked as explicit follow-ups until closed.
