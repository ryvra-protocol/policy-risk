# Release candidate signoff

| Role | Owner | Status | Required evidence | Notes |
|---|---|---|---|---|
| Core Engineering | TBD | PENDING | CI green (`lint-docs`, `version-consistency`, `typecheck`, `tests`) and contract docs reviewed | |
| Ops/SRE | TBD | PENDING | Staging verification evidence and cutover/rollback dry run | |
| Security | TBD | PENDING | `dependency-security` outcome, security triage review, incident readiness | |
| Product Owner | TBD | PENDING | Go/no-go checklist completion and risk acceptance | |

## Signoff rule
All roles must be `APPROVED` before changing final verdict to `READY_FOR_CUTOVER`.
