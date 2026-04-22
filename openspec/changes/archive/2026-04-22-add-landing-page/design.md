## Context

The app is a single-page, no-build static SPA (`index.html` + ES6 modules). All state lives in `main.js` and rendering is driven by a `render()` function that reads from `state`. There is no router. Auth state is stored in `sessionStorage` and checked on load via `auth.js`.

Currently, unauthenticated users land directly on the full compose UI with a sign-in card at the top. There is no introduction to the product.

## Goals / Non-Goals

**Goals:**
- Show a welcoming, informative landing page to unauthenticated users
- Surface the sign-in form prominently as the single call-to-action
- Gate the composer UI behind authentication — composer is invisible until signed in
- Keep the implementation consistent with the existing no-router, state-driven pattern

**Non-Goals:**
- New HTML pages or client-side routing
- Animated transitions between landing and composer (static show/hide is fine)
- Marketing copy, screenshots, or video demos
- Social proof, testimonials, or pricing

## Decisions

### Decision 1: Same `index.html`, CSS show/hide via auth state

The landing page is a new `<section id="landingPage">` in `index.html`. The existing `.app-shell` (composer) remains. `render()` adds/removes `.hidden` on each based on `state.authSession`.

**Alternatives considered:**
- Separate `landing.html` with redirect: adds navigation complexity, breaks OAuth callback handling, inconsistent with the no-router pattern.
- Inline everything into existing auth card area: too cramped, no room for feature highlights.

### Decision 2: Sign-in form is duplicated into the landing page

The landing page contains its own instance of the instance-domain input + sign-in button. These bind to the same handlers as the composer's auth card. The composer's existing auth card (shown when signed out inside `.app-shell`) becomes redundant and is hidden when the landing page is active — simplifying to: landing page = signed-out view, composer = signed-in view.

**Alternatives considered:**
- Move the auth card DOM node into the landing page: avoids duplication but adds complexity to the render/toggle logic since the auth card is referenced by `dom` IDs.

### Decision 3: Landing page layout — two-column hero on desktop, single column on mobile

Left column: project name, tagline, 3–4 feature bullet points. Right column: sign-in form card. On mobile, stacks vertically with sign-in below the copy.

This matches the existing two-column `.layout` pattern used in the composer.

## Risks / Trade-offs

- **Two sign-in form instances** → same `id` on inputs would break DOM queries. Mitigation: give landing page inputs distinct IDs (`landingInstanceInput`) and map them to the same handlers.
- **Flash of wrong screen on OAuth return** → the OAuth callback sets `authSession` in `sessionStorage` before `render()` runs, so the composer shows immediately. No flash expected.
- **Copy maintenance** → feature bullets in HTML are static; if features change, HTML must be updated manually. Acceptable for a small project.
