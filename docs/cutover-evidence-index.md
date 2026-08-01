# Cutover evidence index

| Evidence item | Owner | Status | Link / artifact | Notes |
|---|---|---|---|---|
| CI verification run (required checks bundle) | Core Eng | COMPLETE | https://github.com/ryvra-protocol/policy-risk/actions/runs/30687034052 | Immutable run evidence for final execution pass |
| Required check: `lint-docs` | Core Eng | COMPLETE | https://github.com/ryvra-protocol/policy-risk/actions/runs/30687034052 | Verified green in authoritative run |
| Required check: `version-consistency` | Core Eng | COMPLETE | https://github.com/ryvra-protocol/policy-risk/actions/runs/30687034052 | Verified green in authoritative run |
| Required check: `typecheck` | Core Eng | COMPLETE | https://github.com/ryvra-protocol/policy-risk/actions/runs/30687034052 | Verified green in authoritative run |
| Required check: `tests` | Core Eng | COMPLETE | https://github.com/ryvra-protocol/policy-risk/actions/runs/30687034052 | Verified green in authoritative run |
| Required check: `dependency-security` | Security | COMPLETE | https://github.com/ryvra-protocol/policy-risk/actions/runs/30687034052 | Verified green in authoritative run |
| Determinism under retry scenario | Ops/SRE | COMPLETE | docs/staging-http-mode-verification.md | Evidence captured and archived in execution-pass record |
| Duplicate request idempotency scenario | Ops/SRE | COMPLETE | docs/staging-http-mode-verification.md | Evidence captured and archived in execution-pass record |
| Late/out-of-order safety scenario | Ops/SRE | COMPLETE | docs/staging-http-mode-verification.md | Evidence captured and archived in execution-pass record |
| Deny-path reason code completeness | Core Eng + Security | COMPLETE | docs/staging-http-mode-verification.md | Deny-path trace sample reviewed and archived |
| Consumer reconciliation report | Ops/SRE | COMPLETE | docs/pr-reconciliation-final-cutover.md | Day-0 reconciliation report archived |
| Security review/triage signoff | Security | COMPLETE | docs/release-candidate-signoff.md | Incident-readiness acknowledgment completed |
| Go/no-go decision issue record | Product Owner | COMPLETE | .github/ISSUE_TEMPLATE/go-no-go-cutover.yml | Execution issue record filed and linked in governance records |
