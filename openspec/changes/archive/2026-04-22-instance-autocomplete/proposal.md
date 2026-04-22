## Why

Typing a Mastodon instance domain from memory is a friction point — users often don't know the exact spelling of their instance or want to discover one. Showing suggestions as they type makes sign-in faster and less error-prone.

## What Changes

- The instance domain input on the landing page shows a dropdown of matching instance suggestions as the user types
- Suggestions are fetched from the official `https://api.joinmastodon.org/servers` public directory (312 instances, CORS open) and cached in localStorage for 24 hours
- A small hardcoded fallback list is used if the fetch fails (offline or API unavailable)
- Selecting a suggestion fills the input and dismisses the dropdown
- The same input on the composer's auth card gets the same treatment for consistency
- Keyboard navigation (arrow keys, Enter, Escape) works in the dropdown

## Capabilities

### New Capabilities

- `instance-autocomplete`: Filtered suggestions dropdown on the instance domain input, backed by the live joinmastodon.org directory with localStorage caching and a hardcoded fallback

### Modified Capabilities

- `landing-page`: The sign-in form's instance input gains autocomplete behavior (requirement addition, not replacement)

## Impact

- `js/modules/instances.js`: New module — `loadInstances()` fetches joinmastodon.org API with localStorage cache + fallback list; `filterInstances(list, query)` filters results
- `js/modules/ui.js`: New `renderInstanceDropdown()` helper
- `js/main.js`: Autocomplete event wiring for both instance inputs; lazy-loads instance list on first input focus
- `index.html`: Wrapper elements for dropdown positioning on both inputs
- `styles.css`: Dropdown styles
- No new npm dependencies; one external fetch to `https://api.joinmastodon.org/servers` (public, CORS open, cached 24h in localStorage)
