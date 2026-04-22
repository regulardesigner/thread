## Why

When a user types a Mastodon instance domain that isn't in the autocomplete list, the dropdown disappears silently. Users with niche or self-hosted instances have no confirmation that their input is valid, which creates uncertainty about whether they can proceed.

## What Changes

- When the typed value is a non-empty string that matches no known instances, the autocomplete dropdown shows the typed domain as a single selectable option (e.g., "mastodon.example.com")
- Selecting it fills the input — same behavior as selecting a known instance
- When there are matches, behavior is unchanged (known suggestions only)
- The typed-domain option is visually distinct from regular suggestions (muted label or prefix) to make clear it is a custom entry, not a verified instance

## Capabilities

### New Capabilities

*(none — this is a behavioral refinement to an existing capability)*

### Modified Capabilities

- `instance-autocomplete`: Dropdown now shows the typed value as a fallback option when no known instances match, instead of hiding entirely

## Impact

- `js/modules/instances.js`: `filterInstances()` signature or behavior unchanged; the "show typed value" logic lives in the autocomplete controller
- `js/main.js`: `bindInstanceAutocomplete()` — one additional render path when matches are empty and input is non-empty
- `js/modules/ui.js`: `renderInstanceDropdown()` needs to support a "custom entry" item with a distinct style
- `styles.css`: One new style rule for the custom-entry item
- No new dependencies
