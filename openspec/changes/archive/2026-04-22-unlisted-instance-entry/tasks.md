## 1. CSS — Custom entry style

- [ ] 1.1 Add `.instance-dropdown-custom` rule to `styles.css`: muted text color (`var(--text-soft)`), italic font style, to visually distinguish it from verified-instance suggestions

## 2. JS — `renderInstanceDropdown` update

- [ ] 2.1 Add optional `customEntry` parameter to `renderInstanceDropdown(dropdownEl, matches, onSelect, customEntry = "")` in `js/modules/ui.js`
- [ ] 2.2 When `matches.length === 0` and `customEntry.trim()` is non-empty, render a single `<li class="instance-dropdown-custom" role="option">` with `customEntry` as text content and call `onSelect(customEntry)` on `mousedown`
- [ ] 2.3 When `matches.length > 0`, ignore `customEntry` entirely (existing behavior unchanged)

## 3. JS — `bindInstanceAutocomplete` update

- [ ] 3.1 In `js/main.js`, update the `input` event handler inside `bindInstanceAutocomplete` to pass `inputEl.value.trim()` as the fourth argument to `renderInstanceDropdown`
- [ ] 3.2 Update the `focus` event handler the same way so refocusing with a non-empty unmatched value also shows the custom option

## 4. Verification

- [ ] 4.1 Type "myinstance.xyz" — confirm dropdown shows it as a styled custom option
- [ ] 4.2 Click the custom option — confirm input is filled and dropdown closes
- [ ] 4.3 Press ↓ then Enter on the custom option — confirm keyboard selection works
- [ ] 4.4 Type "mastodon" — confirm only known matches appear, no custom option
- [ ] 4.5 Clear the input — confirm dropdown hides entirely
