# PR reconciliation for final cutover

## Method
1. Identify candidate PR branches and target release commit.
2. Compute merge-base between each PR head and target branch.
3. Validate ancestry to ensure selected PR commit is reachable from protected branch tip.
4. Compare effective diffs (target vs merged state) to detect superseded changes.

## Decision rubric
- **Keep open**: PR contains unique unreconciled changes needed for cutover.
- **Superseded**: All effective changes already present through another merged PR.
- **Close manually with audit note**: API-driven closure unavailable; add rationale and replacement PR/commit link.

## Manual closure/audit procedure
1. Post reconciliation summary comment with merge-base and effective-diff evidence.
2. Label PR as superseded or keep-open decision.
3. Close superseded PR manually when API closure is unavailable.
4. Record closure artifact in cutover evidence index.
