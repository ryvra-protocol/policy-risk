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
| Staging verification evidence collection | DONE | `docs/staging-http-mode-verification.md`, `docs/cutover-evidence-index.md` |
| Cutover/rollback/go-no-go runbooks | DONE | `docs/production-cutover-runbook.md`, `docs/rollback-runbook.md`, `docs/go-no-go-execution.md` |
| Go/no-go issue template | DONE | `.github/ISSUE_TEMPLATE/go-no-go-cutover.yml` |
| Security and dependency governance docs | DONE | `SECURITY.md`, `docs/dependency-policy.md`, `docs/incident-response-template.md` |
| Branch protection settings applied in GitHub | DONE | `docs/branch-protection-required-settings.md` (required checks alignment verified and archived) |
| Final production decision upgraded to READY | DONE | `docs/final-cutover-decision.md`, https://github.com/ryvra-protocol/policy-risk/actions/runs/30687034052 |
