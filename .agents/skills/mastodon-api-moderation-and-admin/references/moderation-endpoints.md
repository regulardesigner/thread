# Mastodon Moderation and Admin Reference

## Official Docs Map

- Reports methods: `https://docs.joinmastodon.org/methods/reports/`
- Admin methods root: `https://docs.joinmastodon.org/methods/admin/`
- Admin accounts: `https://docs.joinmastodon.org/methods/admin/accounts/`
- Admin reports: `https://docs.joinmastodon.org/methods/admin/reports/`
- Admin domain blocks: `https://docs.joinmastodon.org/methods/admin/domain_blocks/`

Use target-instance documentation for exact role and scope requirements.

## Typical Privilege Model

- Read-only admin workflows: admin read scopes plus moderator/admin role.
- Mutating admin workflows: admin write scopes plus moderator/admin role.
- Fine-grained scope names may vary by version and instance policy.

## Core Report Operations

1. List reports
- `GET /api/v1/admin/reports`

2. Get report detail
- `GET /api/v1/admin/reports/:id`

3. Apply report action
- Use the documented admin report action endpoint for the instance/version.
- Always include internal reason metadata in your application logs.

## Core Account Operations

1. List/find accounts
- `GET /api/v1/admin/accounts`

2. Fetch account detail
- `GET /api/v1/admin/accounts/:id`

3. Apply account action
- Use documented account action endpoints supported by the instance.
- Prefer explicit policy mapping for each action type.

## Domain-Level Operations

- List domain blocks: `GET /api/v1/admin/domain_blocks`
- Create/update/remove domain blocks via documented admin routes.
- Validate impact scope (federation and local policy effects) before writes.

## Safety Checklist

- Perform read-before-write checks.
- Record operator ID, timestamp, and policy reason.
- Keep an immutable audit trail for all mutating actions.
- Verify post-action state with a follow-up read.
- Add rate controls and circuit breakers for batch moderation jobs.

## Failure Patterns

- `401 Unauthorized`: Missing or expired token.
- `403 Forbidden`: Valid token without required role/scope.
- `404 Not Found`: Resource missing or unavailable in current API version.
- `429 Too Many Requests`: Back off and resume with checkpointing.
