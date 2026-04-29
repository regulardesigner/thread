## 1. Module API design

- [ ] 1.1 In `js/modules/continuation.js`, add JSDoc `@typedef` blocks for the discriminated result kinds: `Empty`, `InvalidUrl`, `NotSignedIn`, `WrongInstance`, `FetchError`, `WrongAccount`, `Verified`, `Stale`, plus a union `ContinuationResult`
- [ ] 1.2 Decide between `vi.mock` (consistent with `publisher.test.js`) and dependency injection for `apiGetStatus`. Default: `vi.mock`. Document the choice in the function's JSDoc

## 2. Implement `verifyContinuationToot`

- [ ] 2.1 Add `export async function verifyContinuationToot({ authSession, account, rawUrl, generation, getCurrentGeneration })` to `js/modules/continuation.js`
- [ ] 2.2 Step: trim `rawUrl`; if empty, return `{ kind: "empty" }`
- [ ] 2.3 Step: parse the URL via `parseTootUrl`; if `null`, return `{ kind: "invalid-url" }`
- [ ] 2.4 Step: if `authSession` or `account` is missing, return `{ kind: "not-signed-in" }`
- [ ] 2.5 Step: if `parsed.instanceDomain` does not match `authSession.instanceDomain`, return `{ kind: "wrong-instance", parsedInstance, sessionInstance }`
- [ ] 2.6 Step: call `getStatus(authSession.instanceDomain, authSession.accessToken, parsed.statusId)`; on rejection, return `{ kind: "fetch-error", message }`
- [ ] 2.7 Step: after the await, check `getCurrentGeneration() !== generation`; if so, return `{ kind: "stale" }`
- [ ] 2.8 Step: if `status.account.id !== account.id`, return `{ kind: "wrong-account" }`
- [ ] 2.9 Step: return `{ kind: "verified", toot: { statusId: parsed.statusId, instanceDomain: parsed.instanceDomain, text: status.content || "" } }`

## 3. Update tests

- [ ] 3.1 In `tests/continuation.test.js`, add a `describe("verifyContinuationToot", ...)` block
- [ ] 3.2 Test: empty input returns `{ kind: "empty" }` and does not call `getStatus`
- [ ] 3.3 Test: invalid URL returns `{ kind: "invalid-url" }` and does not call `getStatus`
- [ ] 3.4 Test: missing session returns `{ kind: "not-signed-in" }`
- [ ] 3.5 Test: wrong instance returns `{ kind: "wrong-instance" }` with both domains identified, does not call `getStatus`
- [ ] 3.6 Test: `getStatus` rejection returns `{ kind: "fetch-error", message }`
- [ ] 3.7 Test: stale generation returns `{ kind: "stale" }` (simulate by changing `getCurrentGeneration` return between call and resolve)
- [ ] 3.8 Test: account mismatch returns `{ kind: "wrong-account" }`
- [ ] 3.9 Test: success returns `{ kind: "verified", toot: { ... } }` with the parsed status id, instance, and content text

## 4. Wire into `main.js`

- [ ] 4.1 Import `verifyContinuationToot` in `main.js`
- [ ] 4.2 Replace the inline `dom.continuationUrlInput.addEventListener("input", ...)` handler with a thin caller:
  - increment `continuationRequestGen`, capture the value
  - call `verifyContinuationToot` with `getCurrentGeneration: () => continuationRequestGen`
  - switch on `result.kind` to set `state.continuationToot` and `dom.continuationStatus.textContent`
  - call `render()` after each branch
- [ ] 4.3 Preserve the exact existing user-visible status strings (copy byte-for-byte from the current handler)
- [ ] 4.4 Confirm `state.continuationToot = null` paths set the state to `null`, not to `undefined`
- [ ] 4.5 Verify the "Verifying…" interim status still appears (set it before awaiting `verifyContinuationToot`)

## 5. Verification

- [ ] 5.1 Run `npm test` and confirm all suites pass (existing publisher and continuation tests, plus new verifyContinuationToot tests)
- [ ] 5.2 Manual browser test: paste a valid same-instance, owned toot URL → status shows "Verified"
- [ ] 5.3 Manual browser test: paste a wrong-instance URL → status shows the cross-instance message
- [ ] 5.4 Manual browser test: paste a URL whose toot belongs to another account → status shows wrong-account message
- [ ] 5.5 Manual browser test: paste a URL, then immediately type more before the request resolves; verify the in-flight result is discarded
- [ ] 5.6 Manual browser test: clear the input → continuation state and status both clear; no network request fires
- [ ] 5.7 Manual browser test: publish a thread with a verified continuation; confirm all new toots reply to the continuation `statusId` (siblings)
- [ ] 5.8 Confirm `js/main.js` line count has decreased meaningfully (target: ~50 fewer lines)
