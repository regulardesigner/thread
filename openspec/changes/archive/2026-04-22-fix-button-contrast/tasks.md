## 1. Add --btn-text token

- [x] 1.1 In `:root`, add `--btn-text: #ffffff;` (white on dark gray accent in light mode)
- [x] 1.2 In `@media (prefers-color-scheme: dark) :root`, add `--btn-text: #111111;` (near-black on light gray accent in dark mode)

## 2. Apply token to button rule

- [x] 2.1 In the `button` CSS rule, replace `color: #fff;` with `color: var(--btn-text);`

## 3. Verification

- [x] 3.1 Confirm light mode: primary button shows white text on `#333333` background (contrast ≥ 4.5:1)
- [x] 3.2 Confirm dark mode: primary button shows dark text on `#cccccc` background (contrast ≥ 4.5:1)
- [x] 3.3 Confirm `#landingSignInButton` and `#publishButton` both pass in both modes
