# Siri quick capture

POST `https://YOUR-PAISLEYTASK-DOMAIN/api/tasks/quick-capture`

Headers:

```text
Content-Type: application/json
x-quick-capture-token: YOUR_RANDOM_QUICK_CAPTURE_TOKEN
```

JSON body (no identity or assignee fields accepted):

```json
{ "title": "Pick up milk" }
```

Title is trimmed and limited to 1–500 JavaScript string characters. Control characters are rejected; newline/tab are allowed. Body is limited to 4 KiB, including streamed bodies. Never put tokens in the URL.

## Configuration and Vercel

Run `npm run quick-capture:credential` locally in a private terminal. It generates a random 256-bit token and its SHA-256 digest. Store the token only in your personal Shortcut/password manager. Do not share a Shortcut containing it. The generator intentionally prints the new credential; never run it in CI, captured logs, or a shared terminal. The API never logs credentials, headers, titles, or database errors.

Following [Vercel environment variable setup](https://vercel.com/docs/environment-variables), in Vercel Project Settings → Environment Variables, configure these for the intended environment, then redeploy:

| Variable | Value |
| --- | --- |
| `QUICK_CAPTURE_TOKEN_SHA256` | Generator's 64-character hexadecimal SHA-256 digest, never the plaintext token |
| `QUICK_CAPTURE_USER_ID` | Your existing Supabase Auth user UUID, copied from Authentication → Users |
| `QUICK_CAPTURE_USER_EMAIL` | That same existing user's sign-in email |
| `QUICK_CAPTURE_USER_PASSWORD` | That user's existing Supabase password; sensitive server-only variable |
| `NEXT_PUBLIC_SUPABASE_URL` | Existing project URL, already used by the app |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Existing public publishable key, already used by the app |

All `QUICK_CAPTURE_*` variables are server-only. Never prefix them with `NEXT_PUBLIC_`, send them to the browser, or commit `.env.local`. The iPhone receives only the random capture token, never your Supabase password, JWT, or a secret/service-role key. No privileged Supabase key is required or used. For local development, add these variables to the ignored `.env.local` and restart Next.js. Production secrets should not be copied into preview deployments.

The server signs in with the configured account using Supabase's publishable key, verifies the returned user UUID matches `QUICK_CAPTURE_USER_ID`, then inserts through the same insertion primitive as the UI. RLS stays active. This uses the same password authentication the app already uses. Each distinct capture signs in afresh; Supabase Auth rate limits, CAPTCHA, MFA/AAL policies, or a changed password may prevent capture (503). Review whether storing your personal sign-in password server-side fits your requirements before enabling it. No new account is created. See [Supabase password authentication](https://supabase.com/docs/reference/javascript/auth-signinwithpassword) and [RLS documentation](https://supabase.com/docs/guides/database/postgres/row-level-security).

To revoke, remove the digest and redeploy; unconfigured endpoints return 503. To rotate, generate a new credential, replace the digest and redeploy, then replace the token in Shortcuts. Old deployment URLs may retain old environment values: protect or remove old deployments when revoking, and use the production alias in Shortcuts. If the account password changes, update its server variable and redeploy too.

## Apple Shortcuts

1. Create a Shortcut named “Capture task” and add **Dictate Text**.
2. Add **Get Contents of URL** with the HTTPS endpoint above and method **POST**.
3. Add the two headers above. Set request body to **JSON** and add the Text field `title` with **Dictated Text** as its value. Let Shortcuts encode JSON; do not concatenate raw dictated text into a JSON string.
4. Check the returned `ok` value before announcing success. Optionally show an alert for an error instead of automatically retrying indefinitely.
5. Invoke with Siri: “Capture task.”

Responses are JSON and marked `Cache-Control: no-store`:

| HTTP | Meaning |
| --- | --- |
| 201 | Created: `{"ok":true,"duplicate":false}` |
| 200 | Identical capture already succeeded within 60 seconds on this instance: `{"ok":true,"duplicate":true}` |
| 400 | Invalid JSON, title, or extra properties |
| 401 | Missing/incorrect capture credential |
| 413 | Body over 4 KiB |
| 415 | Incorrect content type |
| 429 | Authenticated request limit exceeded; `Retry-After: 60` |
| 503 | Incomplete configuration, user sign-in mismatch/failure, or failed insertion |

Other methods receive Next.js's 405 response. Do not automatically retry an uncertain network outcome without considering duplicates.

## Existing behavior and limitations to review

The repository is Next.js App Router with cookie-based Supabase SSR authentication and server actions. `lib/taskService.ts` is the task service. Existing `assigned_to` values are display names (`Joe`, `Cheryl`, `Joey`), not Auth user UUIDs. Captures are unassigned and have Normal priority, a `30-60 min` estimate, Open status, null notes/deadline/completed timestamp, and the server's current creation timestamp. Ownership columns/defaults/triggers remain the database's responsibility under the verified user's RLS session, matching existing UI inserts.

**Schema review remains required:** there are no checked-in table definitions, policies, migrations, or authenticated database credentials for inspection. The code confirms the available task shape, but cannot verify the deployed ownership defaults or RLS policies. Before enabling production, inspect the deployed `tasks` definition and policies, verify ownership defaults use `auth.uid()` (if there is an owner column), and verify cross-user access is denied. If ownership is implemented differently, adjust the existing shared creation mechanism using the actual schema. Tests mock Supabase; they prove identity binding and insertion payload, not live policy enforcement. Do not weaken RLS to make this work.

`source = 'siri'`, `needs_review`, migrations, and Inbox are deferred until that schema review establishes compatibility. No schema changes are applied. Existing task views and filters are unchanged; captures appear in All and other filters when applicable.

Abuse protection: fixed-size digest comparison, strict credential shape, bounded body/title, 20 authenticated requests per minute per warm instance, and bounded duplicate tracking (maximum 100 entries). Invalid credentials are rejected before JSON parsing or Supabase calls. Use [Vercel Firewall rate limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting) on this exact path for protection against unauthenticated floods; the app does not trust caller-provided IP headers.

Duplicate protection coalesces identical trimmed titles, including concurrent submissions, for 60 seconds on one instance. This intentionally suppresses a second identical task during that minute. It is best effort: cold starts, multiple Vercel instances/regions, slow requests exceeding the window, or an ambiguous database/network outcome can still create duplicates. A durable shared rate limiter/idempotency store is needed for deployment-wide guarantees; it is deferred to avoid introducing unverified schema or infrastructure. Database calls have a 15-second timeout per HTTP operation. No automatic insertion retries are performed.

## Verification

`npm run lint`, `npm run typecheck`, and `npm test`. Tests cover authorization, input limits, defaults, fixed identity, rejection of ownership/assignee overrides, rate limiting, duplicate coalescing, failures, and token rotation. Before enabling: in a reviewed staging database, make a capture and check persisted ownership/defaults and visibility from the existing app; confirm another account cannot read/change it. No live database writes are performed by the test suite.
