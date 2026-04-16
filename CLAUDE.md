# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development

```bash
npm start          # Start HTTP server on port 8080 and open browser
```

No build step — serve files as-is. The app is pure static HTML/CSS/JS with ES6 modules.

## Architecture

**Calm Mastodon Thread Publisher** — a client-side SPA that splits long-form text into Mastodon toots and publishes them as a thread via OAuth PKCE.

### Module responsibilities (`js/modules/`)

| Module | Purpose |
|---|---|
| `constants.js` | Shared config: char limits, localStorage keys, OAuth scopes |
| `auth.js` | PKCE OAuth flow, session verification, sign-out |
| `api.js` | Mastodon HTTP client (apps, instance, statuses, followed tags) |
| `storage.js` | localStorage/sessionStorage wrappers |
| `splitter.js` | Text chunking — respects `---` manual splits and per-instance char limits |
| `publisher.js` | Publish state machine with checkpoint/recovery logic |
| `hashtags.js` | Fetches followed tags, caches per instance, handles cursor insertion |
| `ui.js` | DOM rendering helpers (auth panels, hashtags, split preview, banners) |
| `main.js` | App state, event binding, render orchestration |

### Data flow

1. Sign-in → PKCE OAuth → `accessToken` stored in `sessionStorage`
2. Textarea input → `splitter.js` analyzes → live preview updates
3. "Publish thread" → checkpoint created → `publisher.js` posts each chunk sequentially
   - First toot: `visibility=public`
   - Subsequent toots: `visibility=unlisted`, threaded via `in_reply_to_id`
4. On failure: checkpoint saved; user can retry (auto-resume) or switch to manual one-toot-at-a-time mode

### Key state (managed in `main.js`)

```js
{
  authSession: { instanceDomain, accessToken, tokenType, scopes },
  account: { /* Mastodon account object */ },
  charLimit: 500,           // fetched from instance
  chunks: [],               // current split result
  checkpoint: {             // persisted publish progress
    nextIndex, chunks, publishedStatusIds, rootStatusId, lastError
  },
  focusMode: boolean,
  publishBusy: boolean,
}
```

### Mastodon API endpoints used

- `POST /api/v1/apps` — self-register app on first sign-in
- `GET /oauth/authorize` + `POST /oauth/token` — PKCE flow
- `GET /api/v1/accounts/verify_credentials`
- `GET /api/v2/instance` (fallback: `/api/v1/instance`) — fetch char limit
- `GET /api/v1/followed_tags` — hashtag suggestions (cached in localStorage)
- `POST /api/v1/statuses` — publish toots

### Persistence

- `sessionStorage`: auth token (cleared on tab close)
- `localStorage`: draft content, publish checkpoints, cached hashtags (keyed per instance domain)
