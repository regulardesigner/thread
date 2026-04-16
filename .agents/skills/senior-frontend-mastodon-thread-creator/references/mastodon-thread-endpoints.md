# Mastodon Thread Endpoints Reference

## Docs Map

- Apps: `https://docs.joinmastodon.org/methods/apps/`
- OAuth: `https://docs.joinmastodon.org/methods/oauth/`
- Accounts: `https://docs.joinmastodon.org/methods/accounts/`
- Media: `https://docs.joinmastodon.org/methods/media/`
- Statuses: `https://docs.joinmastodon.org/methods/statuses/`

Always verify target instance behavior when not using stock Mastodon.

## Auth Sequence

1. `POST /api/v1/apps`
2. `GET /oauth/authorize`
3. `POST /oauth/token`
4. `GET /api/v1/accounts/verify_credentials`

## Thread Publish Sequence

1. For each post item, upload media first as needed:
- `POST /api/v2/media` (or `/api/v1/media`)

2. Publish first status:
- `POST /api/v1/statuses`
- Do not set `in_reply_to_id` for first item.

3. Publish each next item as reply to previous published status:
- `POST /api/v1/statuses`
- Set `in_reply_to_id` to previous returned status ID.

4. Optional verification fetch:
- `GET /api/v1/statuses/:id`

## Required Client Behaviors

- Preserve returned status IDs in order.
- Stop chain publishing on unrecoverable error.
- Save checkpoint after each successful publish.
- On retry, skip already published items unless user explicitly requests re-post.

## Failure Handling

- `401`: Re-authentication or token refresh flow.
- `403`: Scope/permission mismatch; show exact missing capability.
- `422`: Validation or payload issue; highlight failing post item.
- `429`: Backoff and resume with checkpoint.
