## Context

Primary buttons currently use `background: var(--accent)` and `color: #fff`. In light mode, `--accent` is `#333333` (dark gray), giving ~12.6:1 contrast against white — excellent. In dark mode, `--accent` is `#cccccc` (light gray), giving ~1.6:1 contrast against white — a serious accessibility failure.

WCAG 2.1 SC 1.4.3 and RGAA 4.1 criterion 3.2 require a minimum 4.5:1 contrast ratio for normal text.

## Goals / Non-Goals

**Goals:**
- Primary buttons meet ≥ 4.5:1 contrast in both light and dark modes
- Fix applies to all primary buttons (no per-button targeting needed)

**Non-Goals:**
- No change to button shape, size, or layout
- No change to secondary button styles (already uses `var(--text)` which is fine)
- No change to `--accent` values

## Decisions

**Introduce `--btn-text`**: A dedicated token for button label color, separate from `--accent`, allows the text to flip independently of the background.

| Mode | `--accent` (bg) | `--btn-text` (text) | Contrast |
|------|----------------|---------------------|----------|
| Light | `#333333` | `#ffffff` | ~12.6:1 ✓ |
| Dark | `#cccccc` | `#111111` | ~10.9:1 ✓ |

Both exceed WCAG AAA (7:1). Hover state uses `--accent-strong` as background:
| Mode | `--accent-strong` (hover bg) | `--btn-text` (text) | Contrast |
|------|------------------------------|---------------------|----------|
| Light | `#111111` | `#ffffff` | ~19.6:1 ✓ |
| Dark | `#eeeeee` | `#111111` | ~16.1:1 ✓ |

## Risks / Trade-offs

No meaningful risks. The change is additive (one new token) and backward-compatible — if a browser somehow ignored the variable, it would fall back to the existing `#fff` value rather than breaking.
