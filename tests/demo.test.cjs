/* eslint-disable @typescript-eslint/no-require-imports -- Node harness loads the actual TypeScript modules. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

function load(file, mocks = {}) {
  const loaded = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(code, { module: loaded, exports: loaded.exports, Date,
    require(name) {
      if (name in mocks) return mocks[name];
      throw new Error(`Unexpected demo dependency: ${name}`);
    },
  });
  return loaded.exports;
}
const { createDemoAccounts } = load("lib/accounts/demo.ts");
const { daysUntilDecay, recordPlayed } = load("lib/accounts/decay.ts");

test("demo has three fresh fictional accounts with urgent, partial and full banks", () => {
  for (const now of [new Date(2026, 10, 10, 12), new Date(2030, 0, 1, 12)]) {
    const accounts = createDemoAccounts(now);
    assert.equal(accounts.length, 3);
    const expected = { Challenger: 1, Diamond: 10, Master: 14 };
    for (const account of accounts) {
      assert.equal(daysUntilDecay(account.decayDate, now), expected[account.tier]);
      assert.equal(account.riotId.endsWith("#DEMO"), true);
      assert.equal(account.id.startsWith("demo-"), true);
    }
  }
});

test("reset creates independent account objects and does not reuse edited samples", () => {
  const first = createDemoAccounts();
  first[0].riotId = "Edited#DEMO";
  first.pop();
  const reset = createDemoAccounts();
  assert.equal(reset.length, 3);
  assert.equal(reset[0].riotId, "NightShift#DEMO");
  assert.notEqual(reset[0], first[0]);
});

test("demo edits, Played and reset use memory without auth, storage or remote imports", async () => {
  const now = new Date(2026, 10, 10, 12);
  const seed = createDemoAccounts(now);
  let current = seed;
  const { DemoDashboard } = load("app/demo/DemoDashboard.tsx", {
    react: { useState: () => [current, (next) => { current = next; }] },
    "react/jsx-runtime": require("react/jsx-runtime"),
    "@/app/components/AccountDashboard": { AccountDashboard: () => null },
    "@/lib/accounts/demo": { createDemoAccounts },
  });
  let screen = DemoDashboard({ initialAccounts: seed });
  assert.equal(screen.props.demo, true);
  assert.equal(screen.props.store.loading, false);
  assert.equal(screen.props.store.importAvailable, false);
  const played = recordPlayed(seed[0], now);
  await screen.props.store.persist([played, ...seed.slice(1)]);
  assert.equal(daysUntilDecay(current[0].decayDate, now), 2);
  assert.equal(daysUntilDecay(seed[0].decayDate, now), 1);
  screen = DemoDashboard({ initialAccounts: seed });
  await screen.props.store.persist([]);
  assert.equal(current.length, 0);
  screen.props.onResetDemo();
  assert.equal(current.length, 3);
  await screen.props.store.confirmImport();
  screen.props.store.dismissImport();
  assert.equal(screen.props.demoReturnToAccounts, false);
  const returningUser = DemoDashboard({ initialAccounts: seed, returnToAccounts: true });
  assert.equal(returningUser.props.demoReturnToAccounts, true);
});
