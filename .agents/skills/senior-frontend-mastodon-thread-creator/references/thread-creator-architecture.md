# Thread Creator Architecture Reference

## Core Data Model

- `Thread`
  - `id`
  - `title` (optional)
  - `items: ThreadItem[]`
  - `defaultVisibility`
  - `createdAt`, `updatedAt`
- `ThreadItem`
  - `localId`
  - `content`
  - `mediaDrafts[]`
  - `cw` (optional)
  - `visibility` (optional override)
  - `language` (optional)
- `PublishCheckpoint`
  - `threadId`
  - `lastPublishedIndex`
  - `lastPublishedStatusId`
  - `publishedStatusIds[]`

## Publish State Machine

1. `idle`
2. `validating`
3. `publishing`
4. `partial_failure` or `completed`

Transition rules:
- Block publish when any item fails validation.
- Move to `partial_failure` on first unrecoverable API error.
- Preserve checkpoint after each successful item publish.

## Draft Persistence

- Save local draft after meaningful edits.
- Keep draft schema versioned for migration safety.
- Persist media metadata and upload status separately from final media IDs.

## Recovery Design

- On reload, inspect last checkpoint.
- Re-fetch already-published statuses before continuing.
- Resume from next unpublished index.
- Offer explicit "resume" and "start new" controls.

## UI Composition Guidance

- Editor column: thread item list + per-item controls.
- Preview column: rendered thread preview.
- Publish panel: validation summary, progress meter, retry controls.

## Testing Focus

- Reply-chain correctness.
- Partial failure at arbitrary item index.
- Retry behavior and deduplication.
- Mobile layout and keyboard operability.
