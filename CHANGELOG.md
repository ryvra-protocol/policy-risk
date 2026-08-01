# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0-rc.1] - 2026-08-01

### Added
- Production-readiness governance artifacts aligned to protocol-core baseline for policy decision scope.
- Cutover, rollback, go/no-go, staging verification, and evidence-index runbooks.
- Compatibility matrix and contract alignment guidance for consumers.
- Version consistency automation script and CI required-check normalization.

### Changed
- CI workflow normalized into deterministic required-check jobs: `lint-docs`, `version-consistency`, `typecheck`, `tests`, `dependency-security`.
- Security and branch-protection guidance expanded with explicit operator procedures.

### Decision status
- Executive verdict: `READY_PENDING_EVIDENCE`.
