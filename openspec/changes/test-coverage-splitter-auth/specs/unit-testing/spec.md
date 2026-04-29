## ADDED Requirements

### Requirement: Splitter module is unit-tested

The project SHALL include a Vitest suite at `tests/splitter.test.js` that verifies the public surface of `js/modules/splitter.js` (`analyzeText` and `splitText`) against the scenarios listed below. The suite SHALL run in the default `node` environment without DOM globals.

#### Scenario: Pure char-limit splitting
- **WHEN** `analyzeText` is called with text that contains no `---` separator and is longer than the char limit
- **THEN** the returned `chunks` array contains slices of the input at exact char-limit boundaries
- **AND** `hasManualSplit` is `false`

#### Scenario: Single manual separator
- **WHEN** `analyzeText` is called with text that contains one `---` line
- **THEN** the text is split into two segments at that line
- **AND** the separator line is not included in any chunk
- **AND** `hasManualSplit` is `true`

#### Scenario: Multiple manual separators
- **WHEN** `analyzeText` is called with text containing two or more `---` lines
- **THEN** the text is split into N+1 segments where N is the separator count

#### Scenario: Mixed manual and char-limit splitting
- **WHEN** a manual segment is longer than the char limit
- **THEN** that segment is further split at char-limit boundaries
- **AND** the resulting chunks all belong to that segment in order

#### Scenario: Empty input
- **WHEN** `analyzeText` is called with an empty string
- **THEN** `chunks` is an empty array
- **AND** no error is thrown

#### Scenario: Whitespace-only input
- **WHEN** `analyzeText` is called with text containing only whitespace
- **THEN** `chunks` is an empty array

#### Scenario: Consecutive separators produce no empty chunks
- **WHEN** `analyzeText` is called with text containing two `---` lines with only whitespace between them
- **THEN** the chunks array contains no empty entries
- **AND** the empty segment is filtered out

#### Scenario: CRLF line endings normalize
- **WHEN** the input uses `\r\n` line endings
- **THEN** the splitter produces the same chunks as it would for `\n` line endings

#### Scenario: Cursor inside a segment maps to the right chunk
- **WHEN** `analyzeText` is called with a cursor position inside the second non-empty segment
- **THEN** `currentChunkIndex` equals the count of chunks in preceding non-empty segments plus the in-segment chunk index of the cursor
- **AND** `currentSplit.segmentIndex` reflects the active raw-segment index (1-based)

#### Scenario: Cursor on a separator line falls into the surrounding segment
- **WHEN** the cursor is positioned on a `---` line
- **THEN** `analyzeText` returns a `currentSplit` for one of the adjacent segments without throwing

#### Scenario: `splitText` matches `analyzeText` chunks
- **WHEN** `splitText(text, limit)` and `analyzeText(text, limit).chunks` are called with the same arguments
- **THEN** they return arrays of equal length with identical contents

### Requirement: Auth module is unit-tested

The project SHALL include a Vitest suite at `tests/auth.test.js` that verifies the public surface of `js/modules/auth.js` (`signIn`, `handleAuthCallback`, `verifySession`, `signOut`, `normalizeInstanceDomain`) against the scenarios listed below. The suite SHALL run in the `jsdom` environment via the `// @vitest-environment jsdom` directive at the top of the file. Network calls SHALL be mocked at the `js/modules/api.js` boundary using `vi.mock`.

#### Scenario: `normalizeInstanceDomain` accepts bare domain
- **WHEN** `normalizeInstanceDomain("Mastodon.Social ")` is called
- **THEN** it returns `"mastodon.social"`

#### Scenario: `normalizeInstanceDomain` accepts URL form
- **WHEN** `normalizeInstanceDomain("https://mastodon.social/@me")` is called
- **THEN** it returns `"mastodon.social"`

#### Scenario: `normalizeInstanceDomain` rejects empty input
- **WHEN** `normalizeInstanceDomain("   ")` is called
- **THEN** it throws an error with a message about entering an instance domain

#### Scenario: `normalizeInstanceDomain` rejects invalid input
- **WHEN** `normalizeInstanceDomain("::not-a-domain")` is called
- **THEN** it throws an error about an invalid instance domain

#### Scenario: `signIn` produces correct PKCE artifacts
- **WHEN** `signIn("mastodon.social")` is invoked with a mocked `registerApp` returning a client id/secret
- **THEN** `savePendingAuth` is called with a `codeVerifier` of expected length, a `state` of expected length, and a `clientId` matching the mock
- **AND** the authorize URL passed to `window.location.assign` includes a `code_challenge` whose value equals base64url(SHA-256(codeVerifier))
- **AND** the authorize URL includes `code_challenge_method=S256` and the same `state` saved to pending auth

#### Scenario: `handleAuthCallback` returns "none" for clean URL
- **WHEN** `window.location.search` contains neither `code` nor `error`
- **THEN** `handleAuthCallback()` returns `{ status: "none" }`
- **AND** no storage is read or modified

#### Scenario: `handleAuthCallback` reports OAuth error param
- **WHEN** `window.location.search` contains `error=access_denied&error_description=User+rejected`
- **THEN** `handleAuthCallback()` returns `{ status: "error", message: "User rejected" }`
- **AND** the search params are stripped from the URL

#### Scenario: `handleAuthCallback` rejects when pending auth is missing
- **WHEN** the URL contains `code` and `state` but no pending auth is stored
- **THEN** `handleAuthCallback()` returns `{ status: "error" }` with a message about missing pending session
- **AND** the search params are stripped from the URL

#### Scenario: `handleAuthCallback` rejects state mismatch
- **WHEN** the URL contains `code` and `state` and pending auth exists with a different `state`
- **THEN** `handleAuthCallback()` returns `{ status: "error" }` with a state-mismatch message
- **AND** pending auth is cleared from storage
- **AND** the search params are stripped from the URL

#### Scenario: `handleAuthCallback` succeeds on valid callback
- **WHEN** the URL contains valid `code` and `state` matching pending auth
- **AND** the mocked `exchangeToken` returns `{ access_token, token_type, scope }`
- **AND** the mocked `verifyCredentials` returns an account object
- **THEN** `handleAuthCallback()` returns `{ status: "success", session, account }`
- **AND** the auth session is saved to sessionStorage with the access token and instance domain
- **AND** pending auth is cleared
- **AND** the search params are stripped from the URL

#### Scenario: `handleAuthCallback` cleans up when token exchange fails
- **WHEN** the URL contains valid `code` and `state` matching pending auth
- **AND** the mocked `exchangeToken` rejects with an error
- **THEN** `handleAuthCallback()` returns `{ status: "error" }` carrying the error message
- **AND** both pending auth and any session are cleared from storage
- **AND** the search params are stripped from the URL

#### Scenario: Origin guard blocks `file://`
- **WHEN** `window.location.protocol` is `"file:"` and `signIn` is called
- **THEN** `signIn` rejects with an error mentioning that local servers must be used over HTTP

#### Scenario: Origin guard blocks plain HTTP on non-localhost
- **WHEN** `window.location.protocol` is `"http:"` and the hostname is not `localhost` or `127.0.0.1`
- **AND** `signIn` is called
- **THEN** `signIn` rejects with an error requiring HTTPS on non-localhost origins

#### Scenario: Origin guard allows HTTP on localhost
- **WHEN** `window.location.protocol` is `"http:"` and the hostname is `localhost`
- **AND** `signIn` is called with mocked dependencies
- **THEN** `signIn` proceeds without throwing

### Requirement: Test environments are documented per file

The project SHALL declare each test file's runtime environment explicitly when it differs from the default. Tests requiring DOM globals SHALL use `// @vitest-environment jsdom` at the top of the file rather than changing the global default in `vitest.config.js`. The `vitest.config.js` default environment SHALL remain `node`.

#### Scenario: jsdom-dependent test declares its environment
- **WHEN** `tests/auth.test.js` is opened
- **THEN** the file's first non-comment line is `// @vitest-environment jsdom` (or an equivalent Vitest-recognized directive)

#### Scenario: Default environment is unchanged
- **WHEN** `vitest.config.js` is read
- **THEN** the `test.environment` setting is `"node"` (or absent, which defaults to `node`)

### Requirement: Test suite remains fast and offline

The unit-test suite SHALL not perform real network calls, real timer waits beyond test fakes, or real OAuth flows. All external dependencies (the Mastodon HTTP API) SHALL be mocked at the `js/modules/api.js` module boundary using Vitest's `vi.mock`.

#### Scenario: No real network in tests
- **WHEN** the suite runs with the network disabled
- **THEN** every test passes
- **AND** no `fetch` failure surfaces from the test output
