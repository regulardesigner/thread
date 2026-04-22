## Context

The app has two instance domain inputs: one on the landing page (`#landingInstanceInput`) and one inside the composer's auth card (`#instanceInput`). Both are plain `<input type="text">` elements today. Users must know and type their instance URL exactly.

The project is a no-build static SPA. All new code must be vanilla JS ES6 modules.

The official joinmastodon.org servers API (`https://api.joinmastodon.org/servers`) is public, CORS-open (`access-control-allow-origin: *`), returns 312 instances with `domain`, `description`, `total_users`, `languages`, and `category` fields, and is cached server-side for 5 minutes with 24-hour stale-while-revalidate. Fetching this list does not leak which instance the user intends to use — it downloads the full public directory, like fetching a dictionary.

## Goals / Non-Goals

**Goals:**
- Show filtered suggestions as the user types in either instance input
- Use the live joinmastodon.org directory (312 instances, always current)
- Cache the fetched list in localStorage with a 24-hour TTL to avoid repeated fetches
- Fall back to a small hardcoded list if the fetch fails (offline, API down)
- Allow keyboard navigation (↑/↓ to move, Enter to select, Escape to close)
- Allow mouse click to select
- Close the dropdown on outside click or focus loss
- Both instance inputs share the same autocomplete logic

**Non-Goals:**
- Showing instance metadata in the dropdown (user count, description, etc.) — domain name only
- Fuzzy matching — case-insensitive substring match on domain name is sufficient
- Autocomplete on any field other than instance domain inputs
- Fetching the list eagerly on page load — lazy load on first input focus

## Decisions

### Decision 1: Fetch from `https://api.joinmastodon.org/servers`, cache in localStorage

`js/modules/instances.js` exports `loadInstances()` — an async function that:
1. Checks localStorage for a cached list with a timestamp; returns it if age < 24h
2. Fetches `https://api.joinmastodon.org/servers`, extracts `domain` strings, stores to localStorage with current timestamp
3. On any fetch error, returns `FALLBACK_INSTANCES` (a hardcoded array of ~12 major instances)

This is called lazily on the first `focus` event on either instance input (not on page load).

**Alternatives considered:**
- Hardcoded static list of ~40 instances: simpler, zero network dependency, but stale and limited. Superseded now that the official API is confirmed CORS-open.
- Fetch on page load: wastes a network round-trip on every visit if the user is already signed in and won't use the landing. Lazy loading avoids this.
- `<datalist>` HTML element: simpler, but no keyboard navigation control, styling is browser-controlled and inconsistent across browsers.

### Decision 2: Custom dropdown as a `<ul>` positioned absolutely below the input

A `<ul id="instanceDropdown" class="instance-dropdown hidden" role="listbox">` is placed inside a `<div class="instance-input-wrap">` wrapper around each instance input. The wrapper is `position: relative` so the dropdown aligns naturally.

Each instance input gets its own dropdown element (two in total). `renderInstanceDropdown(dropdownEl, matches, onSelect)` in `ui.js` populates and shows/hides it.

**Alternatives considered:**
- Single shared dropdown moved in the DOM: avoids duplication but requires re-parenting on focus, which is fragile with absolute positioning.

### Decision 3: Autocomplete controller in `main.js`

The wiring (input handler → filter → render → select) lives in `main.js` as `bindInstanceAutocomplete(inputEl, dropdownEl, getList)`, called once per input. `getList` is a function that returns the currently loaded instance list (or empty array before the fetch completes).

## Risks / Trade-offs

- **Fetch fails (offline/API down)** → `loadInstances()` catches errors and returns `FALLBACK_INSTANCES`. The feature degrades gracefully to the small hardcoded list.
- **First focus triggers a fetch** → ~100-200ms before suggestions appear on the very first visit. After that, localStorage cache is used. Acceptable UX trade-off.
- **API schema changes** → If joinmastodon.org changes the response shape, `domain` extraction breaks silently (empty suggestions, fallback kicks in). Mitigation: the fallback ensures sign-in still works.
- **Two dropdown elements** → Minor HTML duplication. Acceptable for the simplicity it provides vs. shared-element complexity.
- **Keyboard trap edge case** → Close on `blur` with 150ms delay (to allow `mousedown` on a suggestion to register before the input loses focus).
