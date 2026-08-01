# protocol-core alignment gap report (policy-risk)

## Baseline verification
- Verified against `origin/main` at commit `09d2d44933945b8989abfac4708981801a07f842`.
- Working branch matched baseline before this PR.

## Existing controls found on baseline
- Canonical policy decision schema enforced in code/tests (`decision`, `reason_codes`, `policy_version`).
- Canonical reason-code prefix validation and legacy normalization.
- TypeScript typecheck and unit tests present.
- Initial CI pipeline exists.
- Initial security policy exists.

## Missing controls, risk, and remediation
| Gap | Risk if unresolved | Remediation in this PR |
|---|---|---|
| No explicit production-readiness governance artifacts | Cutover decisions become subjective and non-auditable | Added release candidate, signoff, cutover decision, checklist, runbooks, and evidence index docs |
| No protocol-core compatibility/contract alignment docs | Consumer integration drift and breaking changes | Added compatibility matrix and protocol-core contract alignment docs |
| CI has single generic job and unstable required-check naming | Branch protection cannot enforce deterministic gates | Refactored CI into explicit required-check-friendly jobs |
| No automated version consistency checks | Toolchain/version drift can bypass release controls | Added `scripts/validate-version-consistency.mjs` and `validate:versions` script |
| No go/no-go issue template | Execution quality and incident response readiness degrade during launch window | Added go/no-go execution doc and issue template |
| Security and dependency governance docs incomplete | Triage ambiguity and dependency risk handling inconsistency | Expanded `SECURITY.md`; added dependency policy and incident-response template |
| No branch protection operator guide | Misconfigured protection can allow unreviewed or ungated changes | Added exact required-check settings with API and UI verification paths |
| No PR reconciliation final-cutover guidance | Duplicate/superseded PR ambiguity can cause incorrect release basis | Added PR reconciliation artifact with merge-base/effective-diff method |

## Alignment status after remediation
- Framework-level readiness controls are now present and auditable.
- Final execution pass has transitioned verdict to `READY` with `GO` decision based on required-check verification run evidence: https://github.com/ryvra-protocol/policy-risk/actions/runs/30687034052
- Remaining non-CI staging/day-0 artifacts continue as tracked operator follow-ups in `docs/cutover-evidence-index.md`.
