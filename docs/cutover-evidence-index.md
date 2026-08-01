# Cutover evidence index

| Evidence item | Owner | Status | Link / artifact | Notes |
|---|---|---|---|---|
| CI verification run (required checks bundle) | Core Eng | COMPLETE | https://github.com/ryvra-protocol/policy-risk/actions/runs/30687034052 | Immutable run evidence for final execution pass |
| Required check: `lint-docs` | Core Eng | COMPLETE | https://github.com/ryvra-protocol/policy-risk/actions/runs/30687034052 | Verified green in authoritative run |
| Required check: `version-consistency` | Core Eng | COMPLETE | https://github.com/ryvra-protocol/policy-risk/actions/runs/30687034052 | Verified green in authoritative run |
| Required check: `typecheck` | Core Eng | COMPLETE | https://github.com/ryvra-protocol/policy-risk/actions/runs/30687034052 | Verified green in authoritative run |
| Required check: `tests` | Core Eng | COMPLETE | https://github.com/ryvra-protocol/policy-risk/actions/runs/30687034052 | Verified green in authoritative run |
| Required check: `dependency-security` | Security | COMPLETE | https://github.com/ryvra-protocol/policy-risk/actions/runs/30687034052 | Verified green in authoritative run |
| Determinism under retry scenario | Ops/SRE | PENDING | docs/staging-http-mode-verification.md | Owner: Ops/SRE on-call; action: attach staging logs; ETA: 2026-08-02 UTC |
| Duplicate request idempotency scenario | Ops/SRE | PENDING | docs/staging-http-mode-verification.md | Owner: Ops/SRE on-call; action: attach staging logs; ETA: 2026-08-02 UTC |
| Late/out-of-order safety scenario | Ops/SRE | PENDING | docs/staging-http-mode-verification.md | Owner: Ops/SRE on-call; action: attach staging logs; ETA: 2026-08-02 UTC |
| Deny-path reason code completeness | Core Eng + Security | PENDING | docs/staging-http-mode-verification.md | Owner: Core Eng + Security; action: attach deny-path trace sample; ETA: 2026-08-02 UTC |
| Consumer reconciliation report | Ops/SRE | PENDING | docs/pr-reconciliation-final-cutover.md | Owner: Ops/SRE; action: upload day-0 reconciliation report; ETA: 2026-08-02 UTC |
| Security review/triage signoff | Security | PENDING | docs/release-candidate-signoff.md | Owner: Security lead; action: finalize incident-readiness acknowledgment; ETA: 2026-08-02 UTC |
| Go/no-go decision issue record | Product Owner | PENDING | .github/ISSUE_TEMPLATE/go-no-go-cutover.yml | Owner: Product Owner; action: file and link execution issue; ETA: next go/no-go sync (2026-08-02 UTC) |
