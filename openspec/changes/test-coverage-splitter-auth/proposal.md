## Why

Of the nine modules in `js/modules/`, only `publisher.js` and a slice of `continuation.js` have tests. The two highest-risk modules are uncovered:

- `splitter.js` (138 LOC) does manual `---` segment parsing, cursor-position math, and per-segment chunking. It has subtle invariants (cleaned vs raw segment offsets, `currentChunkIndex` across filtered-out empty segments) that a regression would silently break — and any user with a long thread is one off-by-one away from a corrupted publish.
- `auth.js` (225 LOC) is the most security-sensitive module: PKCE code generation, OAuth state validation, callback handling, session verification. Mishandled state-mismatch or pending-auth paths could enable session fixation in a hostile origin scenario. None of these paths is tested today.

Adding tests now codifies behavior before it drifts and gives any future refactor (including the typecheck pass from `dev-tooling-foundations`) a safety net.

## What Changes

- Add `tests/splitter.test.js` covering: char-limit-only splitting, manual `---` segments, mixed manual + char-limit splitting, cursor-to-active-segment mapping, edge cases (empty input, all whitespace, consecutive `---`, cursor on a separator line, CRLF normalization)
- Add `tests/auth.test.js` covering: `normalizeInstanceDomain` (valid forms, error cases), PKCE primitives (`randomString` length/uniqueness, `makeCodeChallenge` SHA-256 + base64url correctness — tested via the exported flow), `handleAuthCallback` paths (no params, error param, missing pending, state mismatch, success), `assertSupportedAppOrigin` rules (file://, http on non-localhost, http on localhost, https)
- Mock the network at the `api.js` boundary (matching the existing publisher test pattern); mock `window`, `crypto`, `sessionStorage`, `localStorage` with minimal stubs as needed
- No changes to source modules under test

## Capabilities

### New Capabilities
- `unit-testing`: project-level requirements for which modules carry unit-test coverage, what scenarios each test suite exercises, and which Vitest environment each suite runs under. Codifies the test contract so future contributors know what coverage to maintain.

### Modified Capabilities
<!-- None: this change adds verification, not new runtime behavior. -->


## Impact

- **New files**: `tests/splitter.test.js`, `tests/auth.test.js`
- **No source changes**: `js/modules/splitter.js` and `js/modules/auth.js` are not modified by this change. If a test surfaces a real bug, the fix is in scope as a follow-up but not part of this change.
- **Test environment**: may require `jsdom` or a small `happy-dom` setup for `auth.js` tests that touch `window.location`, `crypto.subtle`, and `btoa`. The current `vitest.config.js` uses `environment: "node"`. Adding a per-file `// @vitest-environment jsdom` directive (with `jsdom` as a devDependency) avoids changing the global default and keeps publisher tests on the lighter `node` environment.
- **CI**: once `dev-tooling-foundations` lands, these tests run automatically on PR. Until then they run via `npm test`.
