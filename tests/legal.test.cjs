/* eslint-disable @typescript-eslint/no-require-imports -- Node's CommonJS test harness loads compiled route modules. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const { NextRequest, NextResponse } = require("next/server");

// Compile actual handlers; replace only external services so no real users or
// credentials are needed. Production TypeScript is checked separately by tsc.
function load(file, mocks = {}) {
  const source = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const loaded = { exports: {} };
  vm.runInNewContext(code, {
    module: loaded, exports: loaded.exports, URL, process,
    require(name) {
      if (name in mocks) return mocks[name];
      if (name === "@/lib/legal") return load("lib/legal.ts");
      return require(name);
    },
  }, { filename: file });
  return loaded.exports;
}

const version = load("lib/legal.ts").TERMS_VERSION;

test("registration requires explicit boolean agreement without affecting login", () => {
  const { registerSchema, loginSchema } = load("lib/validations/auth.ts");
  const input = { email: "player@example.com", password: "password123", confirmPassword: "password123" };
  for (const acceptTerms of [undefined, false, "true", 1]) {
    assert.equal(registerSchema.safeParse({ ...input, acceptTerms }).success, false);
  }
  assert.equal(registerSchema.safeParse({ ...input, acceptTerms: true }).success, true);
  assert.equal(registerSchema.safeParse({ ...input, acceptTerms: true, confirmPassword: "different" }).success, false);
  assert.equal(loginSchema.safeParse(input).success, true);
});

function acceptanceHandler({ user = { id: "user-a" }, rpcError = null } = {}) {
  const calls = [];
  const handler = load("app/api/legal/accept/route.ts", {
    "@/lib/supabase/server": { createClient: async () => ({
      auth: { getUser: async () => ({ data: { user }, error: null }) },
      rpc: async (name, args) => { calls.push({ name, args }); return { error: rpcError }; },
    }) },
  });
  return { ...handler, calls };
}

function request(body, origin = "https://decaywatch.example") {
  return new Request("https://decaywatch.example/api/legal/accept", {
    method: "POST", headers: { origin, "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

test("acceptance endpoint rejects forged, missing, outdated and cross-origin agreement", async () => {
  const { POST, calls } = acceptanceHandler();
  for (const body of [{}, { accepted: false, version }, { accepted: "true", version }, { accepted: true, version: "old" }, "{invalid"]) {
    assert.equal((await POST(request(body))).status, 400);
  }
  assert.equal((await POST(request({ accepted: true, version }, "https://other.example"))).status, 403);
  assert.equal(calls.length, 0);
});

test("acceptance endpoint authenticates, uses server RPC and handles database failure", async () => {
  const signedOut = acceptanceHandler({ user: null });
  assert.equal((await signedOut.POST(request({ accepted: true, version }))).status, 401);
  assert.equal(signedOut.calls.length, 0);
  const signedIn = acceptanceHandler();
  assert.equal((await signedIn.POST(request({ accepted: true, version, user_id: "victim", accepted_at: "forged" }))).status, 200);
  assert.equal(signedIn.calls[0].name, "accept_current_terms");
  assert.deepEqual(Object.keys(signedIn.calls[0].args), ["requested_version"]);
  assert.equal(signedIn.calls[0].args.requested_version, version);
  const unavailable = acceptanceHandler({ rpcError: { message: "private DB details" } });
  const result = await unavailable.POST(request({ accepted: true, version }));
  assert.equal(result.status, 503);
  assert.equal((await result.text()).includes("private DB details"), false);
});

test("missing legal migration has an actionable error without exposing database details", async () => {
  for (const code of ["PGRST202", "PGRST205", "42P01", "42883"]) {
    const { POST } = acceptanceHandler({ rpcError: { code, message: "private DB details" } });
    const response = await POST(request({ accepted: true, version }));
    assert.equal(response.status, 503);
    const body = await response.json();
    assert.equal(body.code, "LEGAL_SETUP_REQUIRED");
    assert.equal(body.error, "Agreement saving has not been set up yet. Please contact the operator.");
    assert.equal(JSON.stringify(body).includes("private DB details"), false);
  }
});

test("callback exchanges codes, preserves recovery and rejects redirect injection", async () => {
  const codes = [];
  const { GET, DELETE } = load("app/auth/callback/route.ts", {
    "@/lib/supabase/server": { createClient: async () => ({ auth: {
      exchangeCodeForSession: async (code) => { codes.push(code); return { error: code === "bad" ? {} : null }; },
    } }) },
  });
  assert.equal(DELETE, undefined);
  for (const [query, expected] of [
    ["?code=ok", "/"],
    ["?code=ok&next=/reset-password", "/reset-password"],
    ["?code=ok&next=https://evil.example", "/"],
    ["?code=ok&next=//evil.example", "/"],
    ["?code=bad", "/login?error=auth_callback"],
    ["", "/login?error=auth_callback"],
  ]) {
    const result = await GET(new Request(`https://decaywatch.example/auth/callback${query}`));
    assert.equal(result.headers.get("location"), `https://decaywatch.example${expected}`);
  }
  assert.equal(codes.length, 5);
});

test("session gate fails closed and keeps refreshed cookies on redirects", async () => {
  for (const [pathname, user, accepted, dbError, redirected] of [
    ["/", { id: "u" }, false, null, true],
    ["/", { id: "u" }, true, null, false],
    ["/", { id: "u" }, false, {}, true],
    ["/", null, false, null, false],
    ["/privacy", { id: "u" }, false, null, false],
    ["/reset-password", { id: "u" }, false, null, false],
    ["/api/account/delete", { id: "u" }, false, null, false],
    ["/accept-terms", { id: "u" }, false, null, false],
  ]) {
    let checked = false;
    const { updateSession } = load("lib/supabase/session.ts", {
      "@supabase/ssr": { createServerClient: (_url, _key, options) => ({
        auth: { getUser: async () => {
          options.cookies.setAll([{ name: "refreshed", value: "session", options: { httpOnly: true } }]);
          return { data: { user } };
        } },
        from: () => {
          checked = true;
          const query = { select: () => query, eq: () => query, maybeSingle: async () => ({ data: accepted ? { terms_version: version } : null, error: dbError }) };
          return query;
        },
      }) },
    });
    const response = await updateSession(new NextRequest(`https://decaywatch.example${pathname}`));
    assert.equal(response instanceof NextResponse, true);
    assert.equal(response.headers.get("location"), redirected ? "https://decaywatch.example/accept-terms" : null);
    assert.equal(response.cookies.get("refreshed").value, "session");
    assert.equal(checked, pathname === "/" && !!user);
  }
});

test("public demo bypasses session setup even without Supabase configuration", async () => {
  const { updateSession } = load("lib/supabase/session.ts", {
    "@supabase/ssr": { createServerClient: () => { throw new Error("Demo must not initialise auth"); } },
  });
  const response = await updateSession(new NextRequest("https://decaywatch.example/demo"));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("location"), null);
});
