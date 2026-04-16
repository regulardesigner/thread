# Calm Mastodon Thread Publisher v1

## Plan

### Calm Mastodon Thread Publisher v1 (Sign-In, Auto Split, Hashtag Assist, Robust Recovery)

#### Summary
Build a static HTML/CSS/JS single-page app where a user signs in to a chosen Mastodon instance, writes a long text, gets automatic toot splitting, and publishes directly. Behavior: first toot is `public`; all remaining toots are `unlisted` replies to the first toot. Add favorite hashtag insertion from Mastodon followed tags, plus a two-stage recovery flow (`resume` then `manual next`).

#### Key Implementation Changes
- App architecture
  - Client-only app with modules: `auth`, `composer`, `hashtags`, `splitter`, `publisher`, `storage`, `ui`.
  - State model: `AuthState`, `ComposerState`, `SplitResult`, `PublishState`, `PublishCheckpoint`.
- Auth and instance model
  - User enters instance domain at sign-in.
  - OAuth PKCE flow (no backend): app registration, authorize, token exchange, verify credentials.
  - Token stored in `sessionStorage` only; draft/checkpoint in `localStorage`.
- Composer and split
  - One main writing textarea.
  - Fixed-length chunk splitting using instance max chars (from `/api/v2/instance`, fallback `/api/v1/instance`, fallback `500`).
  - Live preview of generated toots with counters.
- Thread publish contract
  - Publish chunk 1: `visibility=public`.
  - Save returned `root_status_id`.
  - Publish chunks 2..N: `visibility=unlisted` and `in_reply_to_id=root_status_id`.
- Failure and recovery flow (decision-complete)
  - On failure, stop immediately and save checkpoint (`root_status_id`, next index, published IDs).
  - `Retry publish` = automatic resume from next pending toot.
  - If resume fails again, switch to `manual-step mode`.
  - `Publish next toot` posts exactly one next pending toot in sequence per click until done.
- Favorite hashtag feature
  - Fetch favorite list from Mastodon followed tags endpoint after sign-in.
  - Cache followed tags locally; if endpoint unavailable, show cached list and non-blocking warning.
  - Hashtag click inserts tag at textarea cursor position (with spacing normalization).
- Calm interface direction
  - System-adaptive theme (light/dark from OS).
  - Low-noise layout, neutral palette, generous spacing, minimal motion.
  - Clear progress and error surfaces without alarm-heavy styling.
  - Composer-focused layout: writing area primary, side panel for hashtags + split preview.

#### Public Interfaces / API Contracts
- Mastodon endpoints used
  - `POST /api/v1/apps`
  - `GET /oauth/authorize`
  - `POST /oauth/token`
  - `GET /api/v1/accounts/verify_credentials`
  - `GET /api/v2/instance` (fallback `/api/v1/instance`)
  - `GET /api/v1/followed_tags` (for favorite hashtags)
  - `POST /api/v1/statuses`
- Internal client methods
  - `signIn(instanceDomain)`, `signOut()`, `verifySession()`
  - `fetchInstanceLimits()`, `splitText(text, limit)`
  - `fetchFavoriteHashtags()`, `insertHashtagAtCursor(tag)`
  - `publishThread(chunks)`, `resumeThread(checkpoint)`, `publishNextPending(checkpoint)`

#### Test Plan
- Auth/session
  - Sign-in success on valid instance; invalid domain error path.
  - Session ends on browser restart; draft/checkpoint remain.
- Split/publish correctness
  - Fixed chunk boundaries respect character limit.
  - First toot public; remaining toots unlisted and reply to first toot ID.
- Hashtag UX
  - Followed tags load after sign-in; insertion occurs at cursor.
  - Endpoint unavailable => cached tags fallback + warning, composer remains usable.
- Recovery behavior
  - Mid-thread failure creates checkpoint.
  - First retry resumes automatically from next pending toot.
  - Second failure transitions to manual-step mode.
  - Manual `Publish next toot` publishes exactly one item and updates checkpoint until completion.
- UI quality
  - Responsive layout (mobile + desktop), keyboard-friendly controls, readable adaptive theming.

#### Assumptions and Defaults
- v1 scope excludes media uploads, scheduling, and per-chunk manual editing.
- “Favorite hashtags” is interpreted as Mastodon followed tags.
- Thread topology remains star-reply to first toot (not chained reply-to-previous).
- If followed tags endpoint is unsupported on some servers, app degrades gracefully to cached/local list.

---

## What Was Implemented

Implemented the full v1 app as a static HTML/CSS/JS project with modular architecture and the recovery flow you requested.

Key files:
- [index.html](/Users/damientailhades/Sites/thread/index.html)
- [styles.css](/Users/damientailhades/Sites/thread/styles.css)
- [main.js](/Users/damientailhades/Sites/thread/js/main.js)
- [auth.js](/Users/damientailhades/Sites/thread/js/modules/auth.js)
- [api.js](/Users/damientailhades/Sites/thread/js/modules/api.js)
- [publisher.js](/Users/damientailhades/Sites/thread/js/modules/publisher.js)
- [hashtags.js](/Users/damientailhades/Sites/thread/js/modules/hashtags.js)
- [splitter.js](/Users/damientailhades/Sites/thread/js/modules/splitter.js)
- [storage.js](/Users/damientailhades/Sites/thread/js/modules/storage.js)
- [ui.js](/Users/damientailhades/Sites/thread/js/modules/ui.js)

What’s implemented:
- OAuth PKCE sign-in for user-selected Mastodon instance (`/api/v1/apps`, `/oauth/authorize`, `/oauth/token`, `/api/v1/accounts/verify_credentials`).
- Session token in `sessionStorage`; draft + checkpoint in `localStorage`.
- Fixed-size toot splitting using instance limit (`/api/v2/instance` fallback `/api/v1/instance` fallback `500`).
- Publishing contract:
  - toot 1 = `public`
  - toot 2..N = `unlisted` replies to toot 1 (`in_reply_to_id = root id`).
- Recovery flow:
  - stop on failure + save checkpoint
  - `Retry publish` resumes automatically
  - if retry fails again, switch to manual-step mode
  - `Publish next toot` publishes exactly one remaining toot at a time.
- Favorite hashtags:
  - loads from `/api/v1/followed_tags`
  - caches locally per instance
  - warning + cache fallback if endpoint fails
  - click inserts hashtag at cursor with spacing normalization.
- Calm, responsive, system-adaptive interface (light/dark), keyboard-safe controls, low-noise styling.

Verification performed:
- Ran `node --check` on all JS files successfully.

Not performed:
- Live end-to-end OAuth/publish test against a real Mastodon instance (requires real credentials and browser flow).

Next steps:
1. Serve the folder with a local static server and run an end-to-end sign-in/publish test.
2. If you want, I can add a minimal smoke test harness for splitter + checkpoint logic next.
