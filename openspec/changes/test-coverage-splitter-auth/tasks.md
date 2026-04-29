## 1. Test environment setup

- [ ] 1.1 Add `jsdom` as a devDependency in `package.json`
- [ ] 1.2 Confirm `vitest.config.js` continues to default to `environment: "node"` (no change required)
- [ ] 1.3 Verify Vitest picks up `// @vitest-environment jsdom` directives by running an empty placeholder test (sanity check; remove placeholder afterward)

## 2. Splitter test suite

- [ ] 2.1 Create `tests/splitter.test.js`
- [ ] 2.2 Test: pure char-limit splitting (input longer than limit, no separators)
- [ ] 2.3 Test: single `---` separator splits into two segments
- [ ] 2.4 Test: multiple `---` separators produce N+1 segments
- [ ] 2.5 Test: mixed manual + char-limit splitting (segment longer than limit gets char-split)
- [ ] 2.6 Test: empty input returns `chunks: []`
- [ ] 2.7 Test: whitespace-only input returns `chunks: []`
- [ ] 2.8 Test: consecutive `---` lines do not produce empty chunks
- [ ] 2.9 Test: CRLF input produces the same chunks as LF input
- [ ] 2.10 Test: cursor at the start, end, on a separator line, and inside a segment maps to the right `currentChunkIndex` and `currentSplit`
- [ ] 2.11 Test: `currentChunkIndex` correctly sums chunk counts across preceding non-empty segments
- [ ] 2.12 Test: `splitText(text, limit)` returns identical chunks to `analyzeText(text, limit).chunks`
- [ ] 2.13 Run `npm test` and confirm new tests pass; if any fail, decide whether the test or the source needs fixing and document the call

## 3. Auth test suite

- [ ] 3.1 Create `tests/auth.test.js` with `// @vitest-environment jsdom` directive at the top
- [ ] 3.2 Set up `vi.mock("../js/modules/api.js", ...)` providing stubs for `registerApp`, `exchangeToken`, `verifyCredentials`, `getAuthorizeUrl`
- [ ] 3.3 `beforeEach`: clear `sessionStorage` and `localStorage`, reset mocks, reset `window.location` and `window.history` stubs as needed
- [ ] 3.4 Test: `normalizeInstanceDomain` accepts bare domain (case-insensitive)
- [ ] 3.5 Test: `normalizeInstanceDomain` accepts full URL and extracts hostname
- [ ] 3.6 Test: `normalizeInstanceDomain` throws on empty input
- [ ] 3.7 Test: `normalizeInstanceDomain` throws on invalid input
- [ ] 3.8 Test: `signIn` writes pending auth with correct `clientId`, `clientSecret`, `codeVerifier`, `state`, `redirectUri`, `scopes`
- [ ] 3.9 Test: `signIn` invokes `window.location.assign` with an authorize URL whose `code_challenge` equals base64url(SHA-256(codeVerifier))
- [ ] 3.10 Test: `signIn` URL includes `code_challenge_method=S256` and the matching `state`
- [ ] 3.11 Test: `handleAuthCallback` returns `{ status: "none" }` when no `code` and no `error` are present
- [ ] 3.12 Test: `handleAuthCallback` reports OAuth error param and strips search
- [ ] 3.13 Test: `handleAuthCallback` rejects when pending auth is missing and strips search
- [ ] 3.14 Test: `handleAuthCallback` rejects state mismatch, clears pending, strips search
- [ ] 3.15 Test: `handleAuthCallback` happy path saves session, clears pending, strips search, returns success
- [ ] 3.16 Test: `handleAuthCallback` clears both pending and session when `exchangeToken` rejects
- [ ] 3.17 Test: origin guard blocks `file://` (verify via `signIn` rejecting with the expected error message)
- [ ] 3.18 Test: origin guard blocks `http://` on non-localhost host
- [ ] 3.19 Test: origin guard allows `http://` on `localhost` and `127.0.0.1`
- [ ] 3.20 Test: `verifySession` returns `{ session, account }` on success
- [ ] 3.21 Test: `signOut` clears pending and session storage entries

## 4. Verification

- [ ] 4.1 Run `npm test` and confirm all suites pass
- [ ] 4.2 Confirm no real network call is made during the suite (run with offline / no internet to verify)
- [ ] 4.3 If `npm run check` exists (after `dev-tooling-foundations` has landed), run it end-to-end to confirm tests still integrate with the rest of the project gates
- [ ] 4.4 If any test surfaces a real bug in `splitter.js` or `auth.js`, file a follow-up change (or, if trivial 1-line fix, address it inline with a clear commit message noting the bug found)
