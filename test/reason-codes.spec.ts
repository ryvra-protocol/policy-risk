import test from "node:test";
import assert from "node:assert/strict";

import { REASON_CODES } from "../src/types/reason-codes.js";

test("reason codes are machine readable strings", () => {
  const values = Object.values(REASON_CODES);
  assert.ok(values.length > 0);

  for (const code of values) {
    assert.match(code, /^[a-z0-9]+(\.[a-z0-9]+)+$/);
  }
});

test("reason codes are unique", () => {
  const values = Object.values(REASON_CODES);
  const unique = new Set(values);
  assert.equal(unique.size, values.length);
});
