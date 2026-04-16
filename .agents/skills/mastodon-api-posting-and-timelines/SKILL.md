---
name: mastodon-api-posting-and-timelines
description: Build and debug Mastodon API workflows for creating, editing, deleting, and interacting with statuses, media attachments, polls, and timelines. Use when implementing feed consumption, publishing pipelines, engagement actions, or pagination logic for Mastodon-compatible servers.
---

# Mastodon API Posting and Timelines

## Overview

Use this skill to implement robust content publishing and timeline retrieval flows against Mastodon APIs. Resolve endpoint/version differences before finalizing client behavior.

## Workflow

1. Define the content objective.
- Publish status.
- Attach media.
- Fetch one or more timelines.
- Perform interactions (favourite, boost, bookmark, vote).
2. Confirm instance capabilities and limits.
- Read `/api/v2/instance` when available.
- Check whether the target instance supports requested features.
3. Build the request chain.
- Upload media first when needed.
- Create or edit status after media IDs are available.
- Apply timeline pagination using server-provided cursors and link headers.
4. Add resilience.
- Handle `429` rate limiting and retry windows.
- Handle content validation errors from status/media endpoints.

## Endpoint Selection

Use [posting-endpoints.md](references/posting-endpoints.md) for endpoint map and request patterns.

Typical publish sequence:
1. `POST /api/v2/media` or `POST /api/v1/media`
2. `POST /api/v1/statuses`
3. `GET /api/v1/statuses/:id` (verification/read-back)

Typical timeline sequence:
1. `GET /api/v1/timelines/home` or other timeline route
2. Re-request with cursor params (`max_id`, `since_id`, `min_id`) as supported

## Implementation Rules

- Upload media and wait for processing state if asynchronous behavior applies.
- Keep timeline pagination deterministic by preserving the cursor used for each page fetch.
- Enforce idempotency in publish flows to avoid duplicate posts on retry.
- Isolate per-instance behavior flags when features diverge.
- Capture API validation errors and expose user-safe remediation text.

## Output Expectations

When performing posting/timeline work, provide:
- Exact endpoint sequence.
- Required scopes and why they are needed.
- Pagination strategy and cursor semantics.
- Rate-limit and retry behavior.
