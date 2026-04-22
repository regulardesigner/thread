## Why

The grayscale theme introduced `--accent: #cccccc` in dark mode, but primary buttons still use hard-coded `color: #fff`. This yields a contrast ratio of ~1.6:1 — far below the 4.5:1 minimum required by WCAG 2.1 AA and RGAA 4.1 (criterion 3.2). The two most visible primary buttons — `#landingSignInButton` and `#publishButton` — are affected.

## What Changes

- Introduce a `--btn-text` CSS custom property: white (`#ffffff`) in light mode, near-black (`#111111`) in dark mode
- Update the primary `button` rule to use `color: var(--btn-text)` instead of the hard-coded `color: #fff`
- All primary buttons inherit the fix automatically, including `landingSignInButton` and `publishButton`

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `theme`: Add WCAG/RGAA contrast requirement for primary button text

## Impact

- `styles.css`: add `--btn-text` to `:root` and dark-mode override; change `button { color }` declaration
- No HTML or JS changes needed
