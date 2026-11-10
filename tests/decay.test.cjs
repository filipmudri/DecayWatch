/* eslint-disable @typescript-eslint/no-require-imports -- Node test runner loads the TypeScript helper without adding a runtime dependency. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const loaded = { exports: {} };
const source = fs.readFileSync(path.join(__dirname, "../lib/accounts/decay.ts"), "utf8");
vm.runInNewContext(ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, { module: loaded, exports: loaded.exports, Date });
const { recordPlayed, daysUntilDecay, DECAY_RULES } = loaded.exports;

const now = new Date(2026, 10, 10, 14, 30);
function account(tier, days) {
  const date = new Date(now);
  date.setDate(date.getDate() + days);
  return { id: tier, riotId: "Player#EUW", server: "EUW", tier,
    decayDate: date.toISOString(), createdAt: "2026-01-01T00:00:00.000Z",
    lastUpdated: "2026-01-01T00:00:00.000Z", note: "Keep this note" };
}

test("Played adds seven Diamond days or one Apex day to the existing bank", () => {
  for (const tier of ["Diamond", "Master", "Grandmaster", "Challenger"]) {
    const input = account(tier, 3);
    const result = recordPlayed(input, now);
    assert.equal(daysUntilDecay(result.decayDate, now), tier === "Diamond" ? 10 : 4);
    assert.equal(result.id, input.id);
    assert.equal(result.note, input.note);
    assert.equal(result.createdAt, input.createdAt);
    assert.equal(result.lastUpdated, now.toISOString());
    assert.equal(daysUntilDecay(input.decayDate, now), 3, "does not mutate the original account");
  }
});

test("Played caps the bank and leaves full accounts unchanged", () => {
  for (const tier of Object.keys(DECAY_RULES)) {
    const cap = tier === "Diamond" ? 28 : 14;
    assert.equal(daysUntilDecay(recordPlayed(account(tier, cap - 1), now).decayDate, now), cap);
    const full = account(tier, cap);
    assert.equal(recordPlayed(full, now), full);
  }
});

test("today and expired accounts bank new days from today without historical debt", () => {
  for (const tier of Object.keys(DECAY_RULES)) {
    for (const days of [0, -1, -30]) {
      assert.equal(daysUntilDecay(recordPlayed(account(tier, days), now).decayDate, now), tier === "Diamond" ? 7 : 1);
    }
  }
});

test("successive matches accumulate until the bank is full", () => {
  for (const tier of Object.keys(DECAY_RULES)) {
    let value = account(tier, 0);
    for (let match = 0; match < 40; match++) value = recordPlayed(value, now);
    assert.equal(daysUntilDecay(value.decayDate, now), tier === "Diamond" ? 28 : 14);
  }
});

test("bank dates follow calendar days across months, leap years and clock changes", () => {
  for (const date of [new Date(2028, 1, 28, 23, 30), new Date(2026, 2, 28, 12), new Date(2026, 9, 24, 12), new Date(2026, 11, 31, 23)]) {
    const input = { ...account("Master", 0), decayDate: date.toISOString() };
    const result = recordPlayed(input, date);
    assert.equal(daysUntilDecay(result.decayDate, date), 1);
    assert.equal(new Date(result.decayDate).getHours(), date.getHours());
  }
});
