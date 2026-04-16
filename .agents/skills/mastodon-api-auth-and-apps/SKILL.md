---
name: mastodon-api-auth-and-apps
description: Implement and troubleshoot Mastodon API authentication and app registration flows, including OAuth2 authorization, token exchange, scope design, token revocation, and account verification. Use when building login flows, service-to-service integrations, bot credentials, or debugging auth failures (401/403/invalid_scope) against Mastodon-compatible servers.
---

# Mastodon API Auth and Apps

## Overview

Use this skill to design reliable Mastodon app onboarding and OAuth flows. Prioritize instance-specific documentation and scope correctness before writing integration code.

## Workflow

1. Identify the integration model.
- Use user-delegated OAuth for actions performed on behalf of a user.
- Use app or service credentials for server automation only when the target API supports it.
2. Confirm the target server and version.
- Read `/api/v2/instance` when available.
- Assume capability differences across Mastodon versions and forks until confirmed.
3. Register or verify app credentials.
4. Select minimum required scopes.
5. Implement authorize and token exchange flow.
6. Validate credentials by calling account verification endpoints.
7. Add explicit handling for token expiry, revocation, and scope mismatch errors.

## Endpoint Selection

Use [auth-endpoints.md](references/auth-endpoints.md) for canonical endpoint choices and request templates.

Common sequence:
1. `POST /api/v1/apps`
2. `GET /oauth/authorize`
3. `POST /oauth/token`
4. `GET /api/v1/accounts/verify_credentials`
5. `POST /oauth/revoke` (on logout or rotation)

## Implementation Rules

- Prefer least-privilege scopes.
- Use PKCE when the client context is public or cannot protect a client secret.
- Normalize base URLs so every request targets the same instance domain.
- Parse error payloads and return actionable auth diagnostics to the caller.
- When documentation conflicts between versions, explicitly pin to the target instance version and note the decision.

## Output Expectations

When performing auth-related work, provide:
- A scope matrix (`scope -> reason`).
- A concrete request sequence with endpoint paths and required parameters.
- Error-handling rules for `401`, `403`, and token/scope problems.
- Notes on any version-specific assumptions.
