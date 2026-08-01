# Dependency policy

## Policy
- Prefer minimal dependencies and standard library where practical.
- New dependencies require maintainer review and documented justification.
- Pin package manager via `packageManager` in `package.json`.
- CI must run `dependency-security` check before merge.

## Security handling
- Investigate high/critical advisories immediately.
- Block production cutover while unresolved exploitable advisories remain.
- Record exceptions with expiry and compensating controls.

## Upgrade cadence
- Review dependency updates at least monthly.
- Prioritize security patches and toolchain consistency updates.
