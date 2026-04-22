## Context

`bindInstanceAutocomplete()` in `main.js` currently calls `renderInstanceDropdown(dropdownEl, matches, onSelect)`. When `matches` is empty, `renderInstanceDropdown` clears the `<ul>` and sets `.hidden`. Users who type a valid but unlisted domain see the dropdown vanish — no confirmation their input is usable.

The fix is entirely within the autocomplete controller and the render helper. No new modules, no API changes.

## Goals / Non-Goals

**Goals:**
- When typed value is non-empty and matches are empty, show the typed value as a selectable option in the dropdown
- The custom-entry item is visually distinct (muted prefix) from known-instance items
- Selecting the custom-entry item fills the input and closes the dropdown, identical to selecting a known instance
- Keyboard navigation (↓/Enter/Esc) works on the custom-entry item exactly as on known items

**Non-Goals:**
- Validating whether the typed domain is actually a Mastodon instance (that happens during sign-in)
- Showing custom entry alongside partial matches — if any matches exist, show only matches

## Decisions

### Decision 1: Pass typed value into `renderInstanceDropdown` as an optional `customEntry`

`renderInstanceDropdown(dropdownEl, matches, onSelect, customEntry)` gains a fourth optional parameter. When `matches.length === 0` and `customEntry` is a non-empty string, the function renders a single `<li class="instance-dropdown-custom">` item with the value. When `matches.length > 0`, `customEntry` is ignored.

The call site in `bindInstanceAutocomplete` passes `inputEl.value.trim()` as `customEntry` on both `focus` and `input` events.

**Alternatives considered:**
- Handle it entirely in `bindInstanceAutocomplete` without touching `renderInstanceDropdown`: would require duplicating the `<li>` creation logic or making the controller aware of DOM details. Passing through `renderInstanceDropdown` keeps DOM manipulation in `ui.js`.
- Always show custom entry alongside matches: clutters the list when good matches exist. "No matches → show custom" is the cleaner rule.

## Risks / Trade-offs

- **Empty string edge case** → `customEntry` is only shown when `matches.length === 0` AND `customEntry.trim()` is non-empty. Focusing an empty input still shows nothing. ✓
- **Ambiguous domain entry** → The custom-entry item displays the raw typed value. If the user types "mastodon" (not a valid domain), selecting it will fill the input with "mastodon". Sign-in will fail later with a meaningful error. This is acceptable — sign-in validation is the right place to catch this.
