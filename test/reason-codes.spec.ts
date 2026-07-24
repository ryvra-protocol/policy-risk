import test from "node:test";
import assert from "node:assert/strict";

import { CANONICAL_REASON_CODE_PREFIXES, REASON_CODES, isCanonicalReasonCode, normalizeReasonCode } from "../src/types/reason-codes.js";

test("reason codes use canonical prefixes", () => {
  const values = Object.values(REASON_CODES);
  assert.ok(values.length > 0);

  for (const code of values) {
    assert.equal(isCanonicalReasonCode(code), true);
    assert.equal(CANONICAL_REASON_CODE_PREFIXES.some((prefix) => code.startsWith(prefix)), true);
  }
});

test("reason codes are unique", () => {
  const values = Object.values(REASON_CODES);
  const unique = new Set(values);
  assert.equal(unique.size, values.length);
});

test("legacy reason codes normalize to canonical prefixes", () => {
  assert.equal(normalizeReasonCode("policy.deny.limit.exceeded"), REASON_CODES.LIMIT_EXCEEDED_ACCOUNT_DAILY);
  assert.equal(normalizeReasonCode("compliance.deny.sanctions.match"), REASON_CODES.SANCTIONS_HIT_PROVIDER_MATCH);
});
