## ADDED Requirements

### Requirement: Continuation URL parsing accepts the standard Mastodon paths

The system SHALL accept Mastodon toot URLs in two path forms: the short form `/@<username>/<status_id>` and the long form `/users/<username>/statuses/<status_id>`. URLs MUST use the `https:` scheme. Any other URL form SHALL be rejected as invalid.

#### Scenario: Short-form URL is accepted
- **WHEN** the user enters `https://mastodon.social/@alice/123456789012345678`
- **THEN** the URL is parsed into `{ instanceDomain: "mastodon.social", statusId: "123456789012345678" }`

#### Scenario: Long-form URL is accepted
- **WHEN** the user enters `https://mastodon.social/users/alice/statuses/123456789012345678`
- **THEN** the URL is parsed into `{ instanceDomain: "mastodon.social", statusId: "123456789012345678" }`

#### Scenario: Non-https URL is rejected
- **WHEN** the user enters `http://mastodon.social/@alice/123`
- **THEN** the URL is treated as invalid and the continuation status text reflects an invalid-URL error

#### Scenario: Unrecognized path is rejected
- **WHEN** the user enters `https://mastodon.social/web/@alice/123`
- **THEN** the URL is treated as invalid and the continuation status text reflects an invalid-URL error

### Requirement: Continuation toot must be on the user's signed-in instance

The system SHALL reject a continuation URL whose host does not match the signed-in instance domain. The user SHALL see a status message naming both the URL's instance and the signed-in instance.

#### Scenario: Wrong-instance URL is rejected
- **GIVEN** the user is signed in to `mastodon.social`
- **WHEN** the user enters a continuation URL whose host is `fosstodon.org`
- **THEN** the continuation toot is not stored
- **AND** the continuation status message identifies both `fosstodon.org` (URL) and `mastodon.social` (signed-in)

### Requirement: Continuation toot must belong to the signed-in account

The system SHALL fetch the toot via the Mastodon API and reject it if its `account.id` does not match the signed-in account's `id`. This prevents continuing a thread from a toot the user does not own.

#### Scenario: Toot owned by another account is rejected
- **WHEN** the verified toot's `account.id` differs from the signed-in account's `id`
- **THEN** the continuation toot is not stored
- **AND** the continuation status message indicates the toot does not belong to the user

#### Scenario: Toot owned by the signed-in account is accepted
- **WHEN** the verified toot's `account.id` matches the signed-in account's `id`
- **AND** instance and URL checks have passed
- **THEN** the continuation toot is stored as `{ statusId, instanceDomain, text }`
- **AND** the continuation status message indicates verification succeeded

### Requirement: Continuation flow tolerates rapid input (race control)

The system SHALL ensure that only the most recent verification call's result mutates state. If the user types more characters while a verification request is in flight, the in-flight request's eventual result MUST be discarded.

#### Scenario: Older request's result is discarded when newer input has fired
- **GIVEN** the user types into the continuation URL input, triggering a verification request
- **WHEN** the user types again before the first request resolves
- **AND** the first request resolves after the second
- **THEN** the first request's result does not update `state.continuationToot`
- **AND** the first request's result does not update the continuation status message

### Requirement: Empty input clears continuation state

The system SHALL clear `state.continuationToot` and the status message when the input becomes empty. Clearing SHALL NOT trigger any network request.

#### Scenario: User clears the input
- **WHEN** the user removes all text from the continuation URL input
- **THEN** `state.continuationToot` becomes `null`
- **AND** the status message is empty
- **AND** no API request is made

### Requirement: Continuation result is exposed as a discriminated value

The `js/modules/continuation.js` module SHALL expose a `verifyContinuationToot` function that returns one of the following discriminated results: `empty`, `invalid-url`, `not-signed-in`, `wrong-instance`, `fetch-error`, `wrong-account`, `verified`, or `stale`. The UI layer SHALL be the only consumer of these values and SHALL map each to user-facing copy and state updates. The module SHALL NOT contain user-facing strings.

#### Scenario: Verified result includes the toot details
- **WHEN** all verification checks pass for an input URL
- **THEN** `verifyContinuationToot` returns `{ kind: "verified", toot: { statusId, instanceDomain, text } }`

#### Scenario: Stale result is signaled when generation has advanced
- **WHEN** `verifyContinuationToot` finishes but the current generation has advanced past the call's generation
- **THEN** the function returns `{ kind: "stale" }`
- **AND** the caller (main.js) does not mutate state in response

#### Scenario: Network failure surfaces as fetch-error
- **WHEN** the underlying status fetch rejects with an error
- **THEN** `verifyContinuationToot` returns `{ kind: "fetch-error", message }` carrying the error message

### Requirement: Continuation publishing posts subsequent toots as siblings

When a continuation toot is set, the system SHALL publish every new thread toot as an `unlisted` reply to the continuation toot's `statusId`. The first toot SHALL NOT be `public`. New toots SHALL be siblings of one another (each replies to the continuation toot, not to the previously published new toot).

#### Scenario: Single-toot continuation
- **GIVEN** a continuation toot is set with `statusId="X"`
- **WHEN** the user publishes a thread of one chunk
- **THEN** the new toot has `visibility="unlisted"` and `in_reply_to_id="X"`

#### Scenario: Multi-toot continuation
- **GIVEN** a continuation toot is set with `statusId="X"`
- **WHEN** the user publishes a thread of three chunks
- **THEN** all three new toots have `visibility="unlisted"` and `in_reply_to_id="X"` (siblings of one another, not chained replies)

### Requirement: Continuation state clears on sign-out and successful publish

The system SHALL clear `state.continuationToot` and reset the URL input both when the user signs out and when a thread is successfully published.

#### Scenario: Sign-out clears continuation
- **WHEN** the user signs out
- **THEN** `state.continuationToot` is `null`
- **AND** the input field is empty

#### Scenario: Successful publish clears continuation
- **WHEN** a publish completes successfully (status `completed`)
- **THEN** `state.continuationToot` is `null`
- **AND** the input field is empty
