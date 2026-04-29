## Context

The existing `tests/publisher.test.js` mocks the network at the `api.js` module boundary (`vi.mock("../js/modules/api.js", ...)`), then calls the publisher with a synthetic session. That pattern is the right baseline: it tests real module logic without hitting the network and without coupling tests to internal helpers.

The two modules being tested have different shapes:

- `splitter.js` is a pure function over text + char limit + cursor. No globals, no IO. Trivially testable in the existing `node` Vitest environment.
- `auth.js` is the opposite — it touches `window.location`, `window.history`, `sessionStorage`, `localStorage`, `crypto.subtle`, `btoa`, `fetch` (indirectly via `api.js`), and reads `window.location.search`. It also throws on `file://` and non-localhost http. These globals don't exist in Node by default.

## Goals / Non-Goals

**Goals:**
- Verify `splitter.js` invariants by enumerating the cases that `analyzeText` handles
- Verify the security-sensitive paths in `auth.js` — especially state-mismatch and missing-pending — actually reject
- Use the existing module-boundary mocking pattern; do not invent a new test style
- Tests are fast (sub-second); no real network, no real timers

**Non-Goals:**
- End-to-end browser tests (Playwright/Puppeteer). Out of scope; vitest unit coverage is the right granularity.
- Testing `main.js` orchestration. Tested indirectly when its consumed modules are tested.
- Fixing bugs the tests surface. Documented as follow-ups; if any are trivial (1-line) they may be fixed inline; otherwise filed as separate changes.
- Coverage thresholds in CI. Coverage gates create churn around test-naming theatre; we'll cover the high-value modules and stop.

## Decisions

### Decision 1: Use `jsdom` per-file for auth tests, keep `node` as the default

Add `jsdom` (or `happy-dom`) as a devDependency. In `tests/auth.test.js`, declare `// @vitest-environment jsdom` at the top of the file. Other tests continue to run in `node`.

**Why:** `auth.js` touches `window`, `document`, `sessionStorage`, `localStorage`, `crypto`. A jsdom environment provides all of these with realistic-enough behavior for unit testing. Switching the global default would slow down the existing fast `node` tests for no benefit.

**Alternative considered:** Hand-rolled stubs for every `window` / `storage` reference. Rejected — fragile, high-maintenance, and the test code becomes more interesting than the code under test.

**Alternative considered:** `happy-dom` instead of `jsdom`. Either works; `jsdom` is the more conservative pick and ships with broader Web Crypto support out of the box. Decide during implementation if `happy-dom` ergonomics are clearly better.

### Decision 2: Mock `api.js` at the module boundary, not `fetch` itself

Follow the publisher test pattern: `vi.mock("../js/modules/api.js", () => ({ registerApp: ..., exchangeToken: ..., verifyCredentials: ... }))`.

**Why:** Tests should describe what `auth.js` does — not the wire format. Mocking at `api.js` keeps tests robust against future `fetch` refactors and leaves `api.js` itself testable independently if we add coverage there later.

**Alternative considered:** Mock `global.fetch`. Rejected — couples tests to HTTP details that `auth.js` shouldn't care about, and exercises code paths that aren't `auth.js`'s responsibility.

### Decision 3: Test PKCE primitives indirectly through `signIn`

`randomString` and `makeCodeChallenge` are not exported. Test them by invoking `signIn(...)` against a mocked `api.js`, capturing the `code_challenge` and `state` written to `savePendingAuth` and the `code_challenge` passed to `getAuthorizeUrl`, then asserting:
- `state` is a hex string of expected length (64 chars from `randomString(32)` × 2 hex per byte)
- `codeVerifier` length matches `randomString(64)` × 2
- `codeChallenge` is the base64url-SHA256 of `codeVerifier` (verified by re-deriving in the test using node's `crypto`)

**Why:** Testing through the public API verifies the contract that actually matters and avoids the temptation to export internals just to test them.

**Alternative considered:** Export `randomString` and `makeCodeChallenge` for direct testing. Rejected — exposes internals as testing artifacts and weakens encapsulation.

### Decision 4: Splitter test cases enumerate the surface, not the implementation

Cases to cover:
1. Pure char-limit splitting (no manual separators)
2. Single manual `---` separator
3. Multiple manual separators
4. Manual separator + chunk that exceeds char limit (segment-then-char-split)
5. Empty input
6. Whitespace-only input
7. Consecutive `---` lines (empty segment between them — must be filtered out)
8. CRLF line endings
9. Cursor at the start, end, on a separator line, inside a segment
10. `currentChunkIndex` across multiple non-empty segments (active is segment 3 → index reflects sum of preceding segment chunk counts)
11. `currentSplit` length and limit on a segment shorter and longer than the limit
12. `splitText` (the simpler exported helper) returns same chunks as `analyzeText`

**Why:** These map directly to user-observable behavior. If a regression breaks any of them, a real user feels it (toot count wrong, cursor highlight off, or text mangled).

### Decision 5: `handleAuthCallback` test cases use a session-storage stub

For each `handleAuthCallback` scenario, set up `window.location.search`, `sessionStorage` (via jsdom), and the mocked `api.js`, then assert:
1. No params → returns `{ status: "none" }`
2. `error` param present → returns `{ status: "error", message: <description> }`, search params stripped
3. `code` present but no pending auth in storage → returns error, search stripped
4. `state` mismatch → returns error, pending cleared, search stripped
5. Happy path → returns `{ status: "success", session, account }`, pending cleared, session saved
6. `exchangeToken` rejects → returns error, both pending and session cleared

**Why:** These are the security-relevant branches. State mismatch in particular is the OAuth CSRF defense; it must be tested.

## Risks / Trade-offs

- **Risk: `jsdom` adds a non-trivial devDependency.** → Acceptable; testing `auth.js` without it requires brittle hand-stubs that lose more value than the dep adds.
- **Risk: tests surface real bugs and block this change.** → Acceptable; if found, file as follow-up changes (or fix inline if trivial). The point of tests is to find these.
- **Risk: tests for `auth.js` become coupled to jsdom version.** → Mitigation: pin major in `package.json`; jsdom's API for storage/location/crypto is stable.
- **Trade-off: testing PKCE indirectly through `signIn` makes assertion code more involved than direct unit tests of `randomString`.** → Accepted in exchange for not exposing internals.

## Migration Plan

This is purely additive. Sequence:

1. Add `jsdom` devDependency.
2. Add `tests/splitter.test.js` (no env directive needed; runs in `node`).
3. Add `tests/auth.test.js` with `// @vitest-environment jsdom`.
4. Run `npm test` and verify all suites pass.

Rollback: delete the new test files. No source code is touched.

## Open Questions

- Are there bugs lurking in `splitter.js` cursor math that the new tests will surface? Almost certainly yes for at least one edge case (consecutive `---` was a likely candidate during code review). Resolution: when a test fails, decide inline whether the spec'd behavior is the test's expectation or the existing implementation; document the call in the commit message.
