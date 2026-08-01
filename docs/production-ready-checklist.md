# Production-ready checklist

| Control area | Status | Evidence pointer |
|---|---|---|
| Baseline gap report against protocol-core | DONE | `docs/protocol-core-alignment-gap-report.md` |
| Release-candidate scope and limitations | DONE | `docs/release-candidate.md` |
| Cross-functional signoff framework | DONE | `docs/release-candidate-signoff.md` |
| Final cutover gate logic | DONE | `docs/final-cutover-decision.md` |
| CI required-check normalization | DONE | `.github/workflows/ci.yml` |
| Version consistency automation | DONE | `scripts/validate-version-consistency.mjs`, `package.json` |
| Compatibility matrix and contract alignment | DONE | `docs/compatibility-matrix.md`, `docs/protocol-core-contract-alignment.md` |
| Staging verification evidence collection | PARTIAL | `docs/staging-http-mode-verification.md` (execution pending) |
| Cutover/rollback/go-no-go runbooks | DONE | `docs/production-cutover-runbook.md`, `docs/rollback-runbook.md`, `docs/go-no-go-execution.md` |
| Go/no-go issue template | DONE | `.github/ISSUE_TEMPLATE/go-no-go-cutover.yml` |
| Security and dependency governance docs | DONE | `SECURITY.md`, `docs/dependency-policy.md`, `docs/incident-response-template.md` |
| Branch protection settings applied in GitHub | TODO | `docs/branch-protection-required-settings.md` (operator action required) |
| Final production decision upgraded to READY_FOR_CUTOVER | TODO | `docs/final-cutover-decision.md` (pending evidence/signoff) |
