# Release candidate signoff

| Role | Owner | Status | Required evidence | Notes |
|---|---|---|---|---|
| Core Engineering | Lead engineer | APPROVED | CI green (`lint-docs`, `version-consistency`, `typecheck`, `tests`) and contract docs reviewed | Approved with run https://github.com/ryvra-protocol/policy-risk/actions/runs/30687034052 |
| Ops/SRE | Ops/SRE on-call | APPROVED | Staging verification evidence and cutover/rollback dry run | Approved; evidence archived in `docs/cutover-evidence-index.md` |
| Security | Security lead | APPROVED | `dependency-security` outcome, security triage review, incident readiness | Approved; `dependency-security` COMPLETE and incident readiness acknowledged |
| Product Owner | Product owner | APPROVED | Go/no-go checklist completion and risk acceptance | Approved; auditable go/no-go execution record completed |

## Signoff rule
Lead engineer may issue final execution-pass `READY`/`GO` once required CI checks are verified; remaining non-CI/operator tasks stay tracked as explicit follow-ups until closed.
