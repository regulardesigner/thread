## 1. HTML — Landing page structure

- [x] 1.1 Add `<section id="landingPage" class="landing hidden">` before `.app-shell` in `index.html`
- [x] 1.2 Add hero area inside landing: project name (`<h1>`), tagline (`<p>`), and feature list (`<ul>`)
- [x] 1.3 Add sign-in card inside landing with `id="landingInstanceInput"` input and `id="landingSignInButton"` button
- [x] 1.4 Hide the existing auth card inside `.app-shell` when landing is active (verify it won't render alongside the landing sign-in form)

## 2. CSS — Landing page layout

- [x] 2.1 Add `.landing` base styles: full-width, centered, max-width container, vertical padding
- [x] 2.2 Add `.landing-hero` two-column grid (copy left, sign-in card right) with `gap`
- [x] 2.3 Add `.landing-features` list styles (no bullets, icon or dash prefix, readable line-height)
- [x] 2.4 Add responsive breakpoint (≤ 960px): `.landing-hero` collapses to single column, sign-in card below copy

## 3. JS — Render logic and event binding

- [x] 3.1 In `js/modules/ui.js`, add `renderLandingPage({ isVisible })` that toggles `.hidden` on `#landingPage` and `.app-shell`
- [x] 3.2 In `js/main.js`, add `landingInstanceInput` and `landingSignInButton` to the `dom` object
- [x] 3.3 In `js/main.js` `render()`, call `renderLandingPage({ isVisible: !state.authSession })` 
- [x] 3.4 In `js/main.js` `bindEvents()`, bind `landingSignInButton` click to the same sign-in handler as the existing auth form (reuse or extract the handler)
- [x] 3.5 Verify: signing in from the landing page navigates to the composer; signing out returns to the landing page

## 4. Validation and polish

- [x] 4.1 Add empty-input guard on `landingSignInButton` click (show inline error or reuse existing banner)
- [x] 4.2 Confirm the landing page is hidden and composer shown immediately after OAuth callback completes (no flash)
- [x] 4.3 Test on narrow viewport that layout stacks correctly
- [x] 4.4 Check both light and dark theme render correctly on the landing page
