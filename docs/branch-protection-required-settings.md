# Branch protection required settings

Apply these settings to the protected production branch (typically `main`).

## Required status checks
Mark these as required and strict:
- `lint-docs`
- `version-consistency`
- `typecheck`
- `tests`
- `dependency-security`

## API verification path
1. Query branch protection settings via GitHub API for target branch.
2. Verify all five required checks are present and exact-name matched.
3. Verify required reviews and stale-approval dismissal settings per org policy.
4. Archive API response snapshot as evidence in cutover records.

## UI fallback path
1. Open repository **Settings → Branches → Branch protection rules**.
2. Edit protected branch rule.
3. Enable **Require status checks to pass before merging**.
4. Select exactly:
   - `lint-docs`
   - `version-consistency`
   - `typecheck`
   - `tests`
   - `dependency-security`
5. Enable strict up-to-date branch requirement.
6. Save and capture screenshot evidence.
