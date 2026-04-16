# Mastodon Auth and Apps Reference

## Official Docs Map

- Apps methods: `https://docs.joinmastodon.org/methods/apps/`
- OAuth methods: `https://docs.joinmastodon.org/methods/oauth/`
- Accounts methods (credential verification): `https://docs.joinmastodon.org/methods/accounts/`
- Scopes and authorization concepts: `https://docs.joinmastodon.org/api/oauth-scopes/`

Always confirm the target instance docs if the server is not stock Mastodon.

## Core Auth Endpoints

1. Register app
- `POST /api/v1/apps`
- Typical params: `client_name`, `redirect_uris`, `scopes`, `website`
- Output includes `client_id` and `client_secret`.

2. Authorize user
- `GET /oauth/authorize`
- Typical query: `client_id`, `redirect_uri`, `response_type=code`, `scope`, `state`
- Add PKCE fields (`code_challenge`, `code_challenge_method`) for public clients.

3. Exchange authorization code for token
- `POST /oauth/token`
- Typical params: `grant_type=authorization_code`, `code`, `redirect_uri`, `client_id`, `client_secret`
- With PKCE, include `code_verifier`.

4. Exchange client credentials (when supported by use case)
- `POST /oauth/token`
- Typical params: `grant_type=client_credentials`, `scope`, `client_id`, `client_secret`

5. Verify account credentials
- `GET /api/v1/accounts/verify_credentials`
- Requires `Authorization: Bearer <access_token>`.

6. Revoke token
- `POST /oauth/revoke`
- Use on logout, key rollover, or incident response.

## Scope Planning Checklist

- Start from required user actions.
- Map each action to a minimal scope set.
- Avoid broad scope requests without explicit need.
- Keep requested scopes stable between authorize and token steps.
- Re-run authorization after scope changes.

## Common Failure Modes

- `invalid_scope`: Requested scope unsupported or mismatched between steps.
- `invalid_grant`: Expired/reused code, redirect URI mismatch, or bad verifier.
- `401 Unauthorized`: Missing/expired token.
- `403 Forbidden`: Token valid but insufficient privileges.

## Integration Notes

- Keep instance URL configurable per tenant or environment.
- Store secrets in environment/secret manager, never hardcode.
- Log request identifiers and sanitized error bodies for supportability.
