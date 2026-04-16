---
name: senior-frontend-mastodon-thread-creator
description: Design and implement a senior-level front-end web app for composing and publishing Mastodon threads using the Mastodon API. Use when building thread creator tools with OAuth login, draft management, media upload, reply-chain publishing, timeline previews, and resilient error handling across Mastodon-compatible instances.
---

# Senior Front-End Mastodon Thread Creator

## Overview

Use this skill to build a high-quality thread creator website/web app for Mastodon. Combine solid front-end architecture with accurate Mastodon API sequencing and instance-aware compatibility handling.

## Product Workflow

1. Authenticate user with Mastodon OAuth.
2. Load profile and instance capabilities.
3. Compose a multi-post thread with per-post media and visibility controls.
4. Validate thread structure before publish.
5. Publish first post, then publish each next post with `in_reply_to_id` chaining.
6. Track publish progress and handle partial failures with recovery options.
7. Persist local drafts and resume interrupted sessions.

## Front-End Architecture

- Use a feature-based folder structure:
  - `auth`
  - `composer`
  - `media`
  - `publisher`
  - `drafts`
  - `settings`
- Keep API client logic isolated from UI components.
- Model thread entities explicitly (`Thread`, `ThreadItem`, `PublishResult`, `DraftState`).
- Use deterministic state transitions for publish lifecycle:
  - `idle`
  - `validating`
  - `publishing`
  - `partial_failure`
  - `completed`

## Mastodon API Rules

- Register app and request only required scopes.
- Verify token with `/api/v1/accounts/verify_credentials` after login.
- Upload media first and attach returned media IDs to statuses.
- Publish thread sequentially using previous status ID as `in_reply_to_id`.
- Respect rate limits and support resume after network interruption.

## UX Requirements

- Show explicit per-post validation before publish.
- Provide reorder/edit/delete controls for thread items.
- Show clear progress during publish (`post 2 of 8`, etc.).
- Surface precise error context (which post failed, why, and retry action).
- Allow safe retry without duplicating already-published statuses.

## Security and Reliability

- Keep tokens out of long-lived insecure storage where possible.
- Redact token values in logs and UI diagnostics.
- Use idempotency guards to prevent duplicate publishes on retry.
- Store publish checkpoints so recovery can continue from last successful item.

## Deliverables

When implementing this skill, provide:
- UI architecture and state model.
- Endpoint sequence for auth, media, and publish chain.
- Error and retry strategy for partial thread publish.
- Draft persistence strategy.
- Accessibility and responsive behavior checks.

## References

- [thread-creator-architecture.md](references/thread-creator-architecture.md)
- [mastodon-thread-endpoints.md](references/mastodon-thread-endpoints.md)
