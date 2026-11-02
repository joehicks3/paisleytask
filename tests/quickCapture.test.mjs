import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createQuickCaptureHandler, insertForCaptureUser } from "../lib/quickCapture.mjs";

const token = "a".repeat(43);
const config = {
  digest: createHash("sha256").update(token).digest("hex"),
  userId: "12345678-1234-1234-1234-123456789abc",
  email: "owner@example.test", password: "test-only", url: "https://example.test", key: "publishable-test",
};
function request(body = { title: "  Buy milk  " }, headers = {}) {
  return new Request("https://example.test/api/tasks/quick-capture", {
    method: "POST", headers: { "content-type": "application/json", "x-quick-capture-token": token, ...headers },
    body: JSON.stringify(body),
  });
}
function setup(overrides = {}) {
  const calls = [];
  const handler = createQuickCaptureHandler({
    getConfig: () => config,
    insert: async (identity, title) => { calls.push({ identity, title }); },
    ...overrides,
  });
  return { handler, calls };
}

test("authorized request trims title and inserts using fixed configuration", async () => {
  const { handler, calls } = setup();
  const result = await handler(request());
  assert.equal(result.status, 201);
  assert.equal(result.headers.get("cache-control"), "no-store");
  assert.deepEqual(calls, [{ identity: config, title: "Buy milk" }]);
});

test("missing and incorrect credentials never insert", async () => {
  const { handler, calls } = setup();
  for (const value of ["", "bad", "b".repeat(43)]) {
    assert.equal((await handler(request({}, { "x-quick-capture-token": value }))).status, 401);
  }
  assert.equal(calls.length, 0);
});

test("rejects empty, oversized, non-string and malformed titles and identity overrides", async () => {
  const { handler, calls } = setup();
  for (const body of [null, [], {}, { title: " " }, { title: 5 }, { title: "x".repeat(501) },
    { title: "hello\u0000" }, { title: "Task", owner_id: config.userId },
    { title: "Task", assigned_to: "Joe" }, { title: "Task", user_id: config.userId }]) {
    assert.equal((await handler(request(body))).status, 400);
  }
  assert.equal(calls.length, 0);
});

test("accepts maximum title; rejects bad media type, JSON, and streamed oversized body", async () => {
  const { handler } = setup();
  assert.equal((await handler(request({ title: "x".repeat(500) }))).status, 201);
  assert.equal((await handler(request({}, { "content-type": "text/plain" }))).status, 415);
  const invalid = request();
  assert.equal((await handler(new Request(invalid, { body: "{" }))).status, 400);
  assert.equal((await handler(request({ title: "x".repeat(5000) }))).status, 413);
});

test("coalesces concurrent repeats; allows a new capture after sixty seconds", async () => {
  let time = 100_000;
  const { handler, calls } = setup({ now: () => time });
  const results = await Promise.all([handler(request()), handler(request()), handler(request())]);
  assert.deepEqual(results.map(r => r.status), [201, 200, 200]);
  assert.equal(calls.length, 1);
  assert.equal((await results[1].json()).duplicate, true);
  time += 60_001;
  assert.equal((await handler(request())).status, 201);
  assert.equal(calls.length, 2);
});

test("failed inserts return generic errors and can be retried", async () => {
  let count = 0;
  const { handler } = setup({ insert: async () => { if (++count === 1) throw new Error("private database detail"); } });
  const result = await handler(request());
  assert.equal(result.status, 503);
  assert.equal((await result.text()).includes("private"), false);
  assert.equal((await handler(request())).status, 201);
});

test("limits authenticated traffic and resets the window", async () => {
  let time = 100_000;
  const { handler, calls } = setup({ now: () => time });
  for (let i = 0; i < 20; i++) assert.equal((await handler(request({ title: `Task ${i}` }))).status, 201);
  const blocked = await handler(request({ title: "Excess" }));
  assert.equal(blocked.status, 429);
  assert.equal(blocked.headers.get("retry-after"), "60");
  assert.equal(calls.length, 20);
  time += 60_001;
  assert.equal((await handler(request())).status, 201);
});

test("missing configuration fails closed; rotation immediately rejects old token", async () => {
  let settings = {};
  const { handler, calls } = setup({ getConfig: () => settings });
  assert.equal((await handler(request())).status, 503);
  settings = { ...config, digest: createHash("sha256").update("b".repeat(43)).digest("hex") };
  assert.equal((await handler(request())).status, 401);
  assert.equal(calls.length, 0);
});

function database(userId = config.userId, authError = null, insertError = null) {
  const inserted = [];
  const credentials = [];
  const client = {
    auth: { signInWithPassword: async (value) => {
      credentials.push(value);
      return { data: { user: { id: userId }, session: {} }, error: authError };
    } },
    from: (table) => {
      assert.equal(table, "tasks");
      return { insert: async (values) => { inserted.push(values); return { error: insertError }; } };
    },
  };
  const factory = (url, key, options) => {
    assert.equal(url, config.url);
    assert.equal(key, config.key);
    assert.equal(options.auth.persistSession, false);
    assert.equal(options.auth.autoRefreshToken, false);
    return client;
  };
  return { factory, inserted, credentials };
}

test("fixed user's RLS client inserts all existing defaults and current timestamp", async () => {
  const db = database();
  const before = Date.now();
  await insertForCaptureUser(db.factory, config, "Task");
  assert.deepEqual(db.credentials, [{ email: config.email, password: config.password }]);
  assert.equal(db.inserted.length, 1);
  const { created_at, ...values } = db.inserted[0];
  assert.ok(Date.parse(created_at) >= before && Date.parse(created_at) <= Date.now());
  assert.deepEqual(values, {
    title: "Task", notes: null, priority: "Normal", estimated_time: "30-60 min",
    assigned_to: null, deadline: null, status: "Open", completed_at: null,
  });
  // Do not invent an owner column. Existing database ownership defaults receive the verified auth.uid().
  assert.equal("owner_id" in values, false);
});

test("wrong authenticated identity or auth failure cannot insert", async () => {
  for (const db of [database("other-user"), database(config.userId, new Error("auth failed"))]) {
    await assert.rejects(() => insertForCaptureUser(db.factory, config, "Task"));
    assert.equal(db.inserted.length, 0);
  }
});

test("RLS/database rejection is propagated without exposing database details", async () => {
  const db = database(config.userId, null, { message: "sensitive policy" });
  await assert.rejects(() => insertForCaptureUser(db.factory, config, "Task"), { message: "Unable to create task." });
});
