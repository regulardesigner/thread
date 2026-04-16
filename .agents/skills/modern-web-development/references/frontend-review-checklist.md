# Front-End Review Checklist

## Structure

- Semantic HTML and clear landmarks.
- No duplicated IDs.
- Valid interactive nesting.

## Accessibility

- Every control has an accessible name.
- Focus states are visible and consistent.
- Modal/drawer flows manage focus correctly.
- Error messages are announced clearly.

## Responsiveness

- Layout works on 320px+ widths.
- Typography scales without clipping.
- Tap targets are practical on mobile.

## Robustness

- Empty/loading/error states are present.
- API failures show actionable user messages.
- Retries/backoff are handled for unstable endpoints.

## Performance

- Avoid forced synchronous layout loops.
- Large lists are paginated or virtualized.
- Images are optimized and dimensioned.
