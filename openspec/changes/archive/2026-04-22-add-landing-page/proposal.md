## Why

The app currently drops users directly into the compose UI with no explanation of what it does or how to get started. New visitors need context before they can sign in, and the sign-in step itself is buried in a card among other UI — there is no clear "start here" moment.

## What Changes

- Add a landing page as the first screen users see when they are not signed in
- Landing page explains what the app does (Mastodon thread publisher) and its key features
- A prominent, single call-to-action ("Sign in with Mastodon") is the only next step
- Once signed in, users proceed directly to the existing compose UI (no change to signed-in experience)
- The landing page is part of the same `index.html` SPA — no routing library, no new page file

## Capabilities

### New Capabilities

- `landing-page`: Unauthenticated welcome screen with project description, feature highlights, and a single sign-in entry point

### Modified Capabilities

- `auth`: Auth section rendering changes — the sign-in form moves into the landing page layout; the existing signed-in session display remains in the composer header

## Impact

- `index.html`: New landing page section added; auth section restructured
- `styles.css`: New landing page layout styles
- `js/modules/ui.js`: New `renderLandingPage()` helper
- `js/main.js`: Render logic gates on auth state — show landing page when signed out, composer when signed in
- No new dependencies, no build changes
