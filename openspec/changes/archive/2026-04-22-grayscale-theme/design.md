## Context

The app currently uses a tinted color palette: blue-accented backgrounds, mauve warn states, and a teal success state. The user wants a neutral grayscale theme where backgrounds, text, and borders are pure gray tones — light but not harsh in light mode, dark but not oppressive in dark mode. The only permitted hues are green for success and red for error/danger.

All theme values are CSS custom properties in `styles.css` under `:root` (light) and `@media (prefers-color-scheme: dark)` (dark). No JS changes are needed.

## Goals / Non-Goals

**Goals:**
- Replace all tinted custom properties with neutral gray values
- Light theme: soft off-white background (~#f4f4f4), near-black text, gray borders
- Dark theme: dark charcoal background (~#1e1e1e), light gray text, subtle gray borders
- Semantic colors: green for `--ok-*` and `--danger-*` → red; remove mauve `--warn-*` (consolidate into danger)
- Shadow becomes neutral gray-black (no blue tint)
- Interactive highlights (hover, selected) use gray mid-tones

**Non-Goals:**
- No changes to layout, spacing, or typography
- No changes to JS or HTML
- No new custom properties beyond what exists today (only replace values)

## Decisions

**Consolidate warn into danger**: The current palette has both `--warn-*` (mauve) and `--danger-*` (red). In a grayscale theme with only red and green as semantics, "warn" and "danger" share the same red hue — so `--warn-bg` and `--warn-text` become the same values as `--danger-bg` / `--danger-text`. This avoids adding new semantic tokens.

**Accent removal**: The old `--accent` / `--accent-strong` are used for interactive UI elements (buttons, focus rings, links). With no permitted hue, interactive elements use a dark gray in light mode and a light gray in dark mode. This keeps the UI clearly interactive without introducing color.

**Light theme target values:**
| Token | Value | Note |
|---|---|---|
| `--bg` | `#f2f2f2` | soft off-white |
| `--surface` | `#ffffff` | white cards |
| `--surface-soft` | `#f8f8f8` | slightly off-white |
| `--border` | `#d0d0d0` | mid-gray |
| `--text` | `#1a1a1a` | near-black |
| `--text-soft` | `#666666` | mid-gray |
| `--accent` | `#333333` | dark gray for interactive |
| `--accent-strong` | `#111111` | darker on hover/active |
| `--danger-bg` | `#fff0f0` | tinted red background |
| `--danger-text` | `#cc2222` | saturated red |
| `--warn-bg` | `#fff0f0` | same as danger |
| `--warn-text` | `#cc2222` | same as danger |
| `--ok-bg` | `#f0fff4` | tinted green background |
| `--ok-text` | `#1a8a3a` | saturated green |
| `--shadow` | `0 8px 24px rgba(0,0,0,0.08)` | neutral |

**Dark theme target values:**
| Token | Value | Note |
|---|---|---|
| `--bg` | `#1e1e1e` | dark charcoal |
| `--surface` | `#282828` | slightly lighter |
| `--surface-soft` | `#303030` | subtle lift |
| `--border` | `#444444` | visible but subtle |
| `--text` | `#e8e8e8` | light gray |
| `--text-soft` | `#999999` | mid-gray |
| `--accent` | `#cccccc` | light gray for interactive |
| `--accent-strong` | `#eeeeee` | near-white on active |
| `--danger-bg` | `#2c1414` | dark red tint |
| `--danger-text` | `#ff6666` | bright red readable on dark |
| `--warn-bg` | `#2c1414` | same as danger |
| `--warn-text` | `#ff6666` | same as danger |
| `--ok-bg` | `#0e2416` | dark green tint |
| `--ok-text` | `#44cc6a` | bright green readable on dark |
| `--shadow` | `0 10px 26px rgba(0,0,0,0.45)` | keep as-is |

## Risks / Trade-offs

**Interactive elements lose color differentiation** → Mitigation: buttons and links will be visually distinct through weight, border, and shape, not color. The grayscale accent still communicates interactivity.

**Red for both warn and danger** → This is acceptable — both represent "something went wrong or needs attention." If a future design pass distinguishes them, new tokens can be introduced then.
