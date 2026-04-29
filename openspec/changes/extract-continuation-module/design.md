## Context

The continuation feature lets a user paste a Mastodon toot URL into the composer; the app verifies the toot exists, belongs to the signed-in account, and is on the same instance, then threads new toots as replies to it. The verification path is asynchronous — it fetches the toot via `api.getStatus`. Today the entire pipeline lives as an inline `addEventListener("input", async ...)` callback inside `bindEvents` in `main.js`.

The pure helpers (`parseTootUrl`, `isSameInstance`) already live in `js/modules/continuation.js`. The async verification layer that wraps them does not. This is the kind of split where the module owns "easy logic" and the consumer owns "hard logic" — exactly backwards from where you want the line drawn.

## Goals / Non-Goals

**Goals:**
- Move all domain logic (parse → instance check → fetch → ownership check) into `continuation.js`
- Return a discriminated result so the UI layer is a flat switch over outcomes
- Preserve the existing race-control behavior: only the latest input event's result mutates state
- Keep `main.js` responsible for state, DOM, and user-facing copy
- Give `tests/continuation.test.js` a single function to exercise for all the verification paths

**Non-Goals:**
- Changing the user-visible behavior of continuation, including error messages, timing, or which strings appear
- Adding new UX (e.g., loading spinners, retry buttons, debouncing)
- Refactoring `main.js` more broadly. Other extractable concerns (autocomplete binding, instance dropdown, etc.) are out of scope. We touch only the continuation handler.
- Introducing dependency injection or a service layer abstraction. The function takes the deps it needs as arguments.

## Decisions

### Decision 1: Discriminated result, presentation-agnostic

Return shape:

```
{ kind: "empty" }
{ kind: "invalid-url" }
{ kind: "not-signed-in" }
{ kind: "wrong-instance", parsedInstance, sessionInstance }
{ kind: "fetch-error", message }
{ kind: "wrong-account" }
{ kind: "verified", toot: { statusId, instanceDomain, text } }
```

`main.js` switches on `kind`, sets the appropriate status text, and updates `state.continuationToot`.

**Why:** Keeps the module ignorant of UI copy. Changing a status string or localizing it later doesn't require changes inside `continuation.js`. Mirrors how `publisher.js` already returns `{ status: "completed" | "failed" | "partial", ... }`.

**Alternative considered:** Return `{ ok: boolean, message: string }`. Rejected — collapses meaningful distinctions (instance mismatch vs network error vs ownership) into a single string and forces the UI to parse copy.

**Alternative considered:** Throw exceptions for bad outcomes, return on success. Rejected — the "wrong instance" or "wrong account" cases are not exceptional; they're expected results of validation. Throwing for non-exceptional control flow makes the call site harder to reason about.

### Decision 2: Race control stays in `main.js`, passed in as a generation token

`main.js` continues to maintain `continuationRequestGen`. Each call to `verifyContinuationToot` is given a `generation` value and a `getCurrentGeneration` callback. Inside the function, after the async `getStatus` call, the function checks if its generation is still current; if not, it returns `{ kind: "stale" }` and `main.js` discards the result.

**Why:** Race control is a UI-layer concern (which event-loop turn's typing wins), not a domain concern. Keeping the counter in `main.js` matches existing patterns (see `continuationRequestGen` already there). Passing in a getter rather than a value lets the function check current-vs-saved at the right moments.

**Alternative considered:** Make the function return a `Promise` plus a cancel token, AbortController-style. Rejected — `getStatus` already supports `fetch` cancellation in principle, but the existing code does not, and adding it is out of scope. The generation-counter approach is what already exists; the extraction should not change the semantics.

**Alternative considered:** Keep race control inside the module as a closure factory. Rejected — moves a piece of UI state into a non-UI module, blurring the boundary the extraction is meant to clarify.

### Decision 3: `getStatus` is injected, not imported

The function signature is:

```js
async function verifyContinuationToot({
  authSession,
  account,
  rawUrl,
  generation,
  getCurrentGeneration,
  apiGetStatus,  // dependency, defaults to api.getStatus
})
```

The default value imports `getStatus` from `api.js` so production code passes nothing. Tests pass a mock.

**Why:** Avoids the `vi.mock` pattern when a function arg accomplishes the same thing more cleanly. Other modules in this codebase (e.g., `publisher.js`) use `vi.mock` because their imports are leaf-level; here we have the option to thread the dep through, which is simpler for readers.

**Alternative considered:** Import `getStatus` directly and rely on `vi.mock` like the publisher tests. Acceptable, and consistent with existing test patterns. Either approach works; pick one in implementation. If consistency wins, use `vi.mock`. If clarity wins, inject.

This is the one decision worth deferring to the implementation step. Default to `vi.mock` for consistency unless there's a concrete reason to deviate.

### Decision 4: Status copy lives where it lives today

The existing string literals in `main.js` ("Verifying…", "Verified — new toots will continue this thread.", "Could not load toot: …", etc.) stay in `main.js`. The handler maps `kind` to a string and writes it to `dom.continuationStatus`.

**Why:** This change is about reducing `main.js` length and clarifying responsibilities, not centralizing strings. Premature i18n or string-table extraction is out of scope.

## Risks / Trade-offs

- **Risk: race-control behavior subtly changes during the move.** → Mitigation: the existing test file (`tests/continuation.test.js`) gets new tests covering "stale generation" before the implementation lands, so any change in semantics surfaces as a failing test.
- **Risk: error-message strings drift in the move.** → Mitigation: copy the strings byte-for-byte during extraction; verify by diff that no string literal in the user-visible path changed.
- **Trade-off: discriminated result requires the UI layer to switch on `kind`, slightly more code than `if/else` chains today.** → Accepted. The switch makes outcomes explicit and adds a compile-time-ish guarantee that all cases are handled (especially once `dev-tooling-foundations` adds `// @ts-check` and the result type is declared in JSDoc).
- **Trade-off: extracting one part of `main.js` doesn't fix the file's overall size.** → Accepted; this change is scoped to the highest-leverage extraction. Other extractions are separate work.

## Migration Plan

This is a pure internal refactor. Sequence:

1. Add `verifyContinuationToot` and supporting types to `js/modules/continuation.js`. Write the function but don't call it yet.
2. Add tests for `verifyContinuationToot` covering each `kind` (mocking `apiGetStatus` whichever way Decision 3 lands).
3. Replace the inline handler in `main.js` with a thin caller that switches on `kind`, sets state, writes status copy.
4. Run `npm test` and manually verify in a browser (paste a real toot URL, then a wrong-instance one, then a non-owned one).

Rollback: revert the change. No persisted state, no API contract.

## Open Questions

- **Decision 3 — vi.mock vs injection?** Default to `vi.mock` for consistency with `publisher.test.js` unless a concrete reason emerges during implementation. Document the choice in the commit.
- **Should `verifyContinuationToot` debounce input?** Out of scope. Today's behavior fires on every input event; that's a UX question, not a refactoring question.
