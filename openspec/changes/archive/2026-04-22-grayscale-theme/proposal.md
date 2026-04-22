## Why

The current theme uses a custom color palette that includes tinted backgrounds and accent hues. The desired aesthetic is a clean grayscale base — soft light backgrounds and dark-but-not-black dark backgrounds — with only green (success) and red (error) as semantic color accents.

## What Changes

- Replace all background, surface, text, and border CSS custom properties with grayscale values
- Light theme: off-white backgrounds, dark gray text, mid-gray borders — readable but not glaring
- Dark theme: dark charcoal backgrounds (not pure black), light gray text, subtle borders
- Retain green (`--color-success`) and red (`--color-error`) as the only hue accents
- Remove all tinted/colored accent properties (current `--accent`, `--accent-strong`, mauve warn colors, etc.)
- Interactive highlights (hover, focus, selected) use grayscale mid-tones only

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `theme`: CSS custom property palette switches from tinted hues to grayscale with green/red semantic colors only

## Impact

- `styles.css`: `:root` and `@media (prefers-color-scheme: dark)` blocks fully replaced
- Any references to `--accent`, `--accent-strong`, `--warn-bg` in CSS rules may need adjustment if they relied on color; replace with grayscale or semantic tokens
- No JS changes required — theme is purely CSS custom properties
