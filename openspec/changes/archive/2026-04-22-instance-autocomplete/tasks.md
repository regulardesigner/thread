## 1. Instance list module

- [x] 1.1 Create `js/modules/instances.js` with `FALLBACK_INSTANCES` — a hardcoded array of ~12 major Mastodon instance domains (mastodon.social, mstdn.social, fosstodon.org, etc.)
- [x] 1.2 Add `loadInstances()` async function: check localStorage for cached list + timestamp; if age < 24h return cached array; otherwise fetch `https://api.joinmastodon.org/servers`, extract `domain` strings, store to localStorage with timestamp; on any error return `FALLBACK_INSTANCES`
- [x] 1.3 Export `filterInstances(list, query)` that returns items from `list` whose domain contains `query` (case-insensitive substring), max 8 results, empty array when query is empty or list is empty

## 2. HTML — Dropdown elements and input wrappers

- [x] 2.1 Wrap `#instanceInput` in `index.html` with `<div class="instance-input-wrap">` and add `<ul id="instanceDropdown" class="instance-dropdown hidden" role="listbox">` after the input
- [x] 2.2 Wrap `#landingInstanceInput` in `index.html` with `<div class="instance-input-wrap">` and add `<ul id="landingInstanceDropdown" class="instance-dropdown hidden" role="listbox">` after the input

## 3. CSS — Dropdown styles

- [x] 3.1 Add `.instance-input-wrap` with `position: relative` and ensure it doesn't break the existing `.auth-controls` grid layout (use `display: contents` only if grid layout is preserved, otherwise wrap differently)
- [x] 3.2 Add `.instance-dropdown` styles: absolute position below the input (`top: 100%; left: 0; right: 0`), `var(--surface)` background, `var(--border)` border, `var(--radius)` border-radius, `var(--shadow)`, `z-index: 100`, `list-style: none`, `padding: 0`, `margin: 0`
- [x] 3.3 Add `.instance-dropdown li` styles: padding `0.55rem 0.8rem`, cursor pointer
- [x] 3.4 Add `.instance-dropdown li:hover` and `.instance-dropdown li[aria-selected="true"]` highlight with `color-mix(in oklab, var(--surface), var(--accent) 14%)` background

## 4. JS — Autocomplete controller

- [x] 4.1 In `js/modules/ui.js`, add `renderInstanceDropdown(dropdownEl, matches, onSelect)` that creates `<li role="option">` items for each match and shows/hides the `<ul>`
- [x] 4.2 In `js/main.js`, import `loadInstances` and `filterInstances` from `instances.js` and add dom refs: `instanceDropdown`, `landingInstanceDropdown`
- [x] 4.3 In `js/main.js`, declare `let instanceList = []` at module scope; write `bindInstanceAutocomplete(inputEl, dropdownEl)` that wires:
  - `focus` (once): call `loadInstances()`, store result in `instanceList`
  - `input`: call `filterInstances(instanceList, inputEl.value)` → `renderInstanceDropdown`
  - `keydown`: ArrowDown/ArrowUp move `aria-selected` highlight; Enter selects highlighted item; Escape hides dropdown
  - `blur` (150ms delay): hide dropdown
- [x] 4.4 In `js/main.js` `bindEvents()`, call `bindInstanceAutocomplete` for both input/dropdown pairs
- [x] 4.5 In `renderInstanceDropdown` item click handler: use `mousedown` + `preventDefault()` to prevent blur firing before selection, then set input value and hide dropdown

## 5. Verification

- [x] 5.1 Confirm first focus triggers the API fetch and suggestions appear for "mastodon" (including mastodon.social)
- [x] 5.2 Confirm second focus uses localStorage cache (no new network request)
- [x] 5.3 Confirm keyboard navigation (↓, Enter) selects a suggestion and fills the input
- [x] 5.4 Confirm Escape closes the dropdown without selecting
- [x] 5.5 Confirm clicking outside closes the dropdown
- [x] 5.6 Confirm the composer auth card input also has working autocomplete
