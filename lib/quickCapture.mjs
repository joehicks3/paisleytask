import { createHash, timingSafeEqual } from "node:crypto";
import { insertTask, quickCaptureValues } from "./taskInsert.mjs";

const MAX_BODY = 4096;
export const MAX_TITLE = 500;
const WINDOW = 60_000;
const DEDUP_WINDOW = 60_000;

/** Authenticate as the configured existing user; never bypass RLS or use request identity. */
export async function insertForCaptureUser(createClient, config, title) {
  const client = createClient(config.url, config.key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(15_000) }) },
  });
  const { data, error } = await client.auth.signInWithPassword({
    email: config.email,
    password: config.password,
  });
  if (error || !data.user || data.user.id !== config.userId || !data.session) {
    throw new Error("Quick capture user authentication failed.");
  }
  // Ownership defaults/triggers use this authenticated user's auth.uid(), exactly as in the UI.
  await insertTask(client, quickCaptureValues(title));
}

async function readBody(request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Missing body");
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY) {
        await reader.cancel();
        return { oversized: true };
      }
      chunks.push(Buffer.from(value));
    }
    return { value: JSON.parse(Buffer.concat(chunks).toString("utf8")) };
  } finally {
    reader.releaseLock();
  }
}

/** State is deliberately bounded and instance-local; see deployment limitations in docs. */
export function createQuickCaptureHandler({ getConfig, insert, now = Date.now }) {
  let windowStart = 0;
  let attempts = 0;
  const recent = new Map();
  const reply = (status, body, headers = {}) => Response.json(body, {
    status, headers: { "Cache-Control": "no-store", ...headers },
  });

  return async function POST(request) {
    const config = getConfig();
    if (!/^[a-f0-9]{64}$/i.test(config.digest ?? "") ||
        !/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(config.userId ?? "") ||
        !config.email || !config.password || !config.url || !config.key) {
      return reply(503, { error: "Quick capture is not configured." });
    }
    const token = request.headers.get("x-quick-capture-token") ?? "";
    const actual = createHash("sha256").update(token).digest();
    const expected = Buffer.from(config.digest, "hex");
    const valid = timingSafeEqual(actual, expected) && /^[A-Za-z0-9_-]{43}$/.test(token);
    if (!valid) return reply(401, { error: "Unauthorized." });

    const time = now();
    if (time - windowStart >= WINDOW) { windowStart = time; attempts = 0; }
    if (++attempts > 20) {
      return reply(429, { error: "Too many requests." }, { "Retry-After": "60" });
    }
    if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
      return reply(415, { error: "Content-Type must be application/json." });
    }
    const length = Number(request.headers.get("content-length"));
    if (length > MAX_BODY) return reply(413, { error: "Request body too large." });
    let body;
    try {
      const parsed = await readBody(request);
      if (parsed.oversized) return reply(413, { error: "Request body too large." });
      body = parsed.value;
    } catch {
      return reply(400, { error: "Invalid JSON body." });
    }
    if (!body || typeof body !== "object" || Array.isArray(body) ||
        Object.keys(body).some((key) => key !== "title") || typeof body.title !== "string") {
      return reply(400, { error: "Expected only a title string." });
    }
    const title = body.title.trim();
    if (!title || title.length > MAX_TITLE || /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(title)) {
      return reply(400, { error: `Title must contain 1–${MAX_TITLE} characters without control characters.` });
    }
    for (const [key, entry] of recent) {
      if (entry.expires <= time) recent.delete(key);
    }
    // Includes credential digest so rotation never replays a prior credential's request.
    const key = createHash("sha256").update(`${config.digest}:${config.userId}:${title}`).digest("hex");
    const existing = recent.get(key);
    if (existing) {
      const success = await existing.pending;
      return success ? reply(200, { ok: true, duplicate: true }) : reply(503, { error: "Unable to create task." });
    }
    if (recent.size >= 100) return reply(429, { error: "Too many pending captures." }, { "Retry-After": "60" });
    // Store promise before starting I/O to coalesce concurrent identical submissions.
    const pending = Promise.resolve().then(() => insert(config, title)).then(() => true, () => false);
    recent.set(key, { expires: time + DEDUP_WINDOW, pending });
    if (!await pending) {
      recent.delete(key);
      return reply(503, { error: "Unable to create task." });
    }
    return reply(201, { ok: true, duplicate: false });
  };
}
