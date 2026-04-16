# HTML, CSS, and JavaScript Standards

## HTML

- Use landmark elements: `header`, `nav`, `main`, `aside`, `footer`.
- Use heading hierarchy without skipping levels.
- Prefer buttons for actions and links for navigation.
- Keep forms explicit: `label`, `fieldset`, `legend`, validation feedback.

## CSS

- Define global tokens in `:root` for color, spacing, type scale, radius, and motion.
- Structure styles by concern:
  - Base
  - Layout
  - Components
  - Utilities
- Avoid deep selector chains and excessive specificity.
- Prefer logical properties when layout must support varied writing directions.

## JavaScript

- Use modules and keep one responsibility per file.
- Initialize behavior after DOM is ready.
- Separate data fetching, state updates, and DOM rendering concerns.
- Centralize API/network error handling.
- Use abortable requests for interactive search/filter flows.

## Browser Safety

- Confirm APIs are supported by target browsers.
- Add feature detection for non-universal APIs.
- Avoid relying on experimental APIs in critical user paths.

## QA Baseline

- Keyboard-only pass.
- Screen-reader sanity pass on key workflows.
- Responsive checks at small/medium/large viewport sizes.
- Console and network error pass.
