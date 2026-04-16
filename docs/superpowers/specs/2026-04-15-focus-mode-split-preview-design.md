# Focus Mode Split Preview Design

**Date:** 2026-04-15

## Goal

In focus mode, show the split preview panel to the right of the writing area (2/3 writing, 1/3 preview). Automatically scroll the current toot into view in the preview as the cursor moves.

## Approach

Option A: duplicate preview element inside the focus panel. Both the normal `#splitPreview` and a new `#focusSplitPreview` are rendered simultaneously on every `refreshSplitState` call. No DOM moving, fits the existing `dom` refs pattern.

## Changes

### `splitter.js` — add `currentChunkIndex`

`analyzeText` already computes `chunksPerSegment` (per-segment chunk counts) locally. Add `currentChunkIndex` to the return value: sum `chunksPerSegment[0..filteredActiveSegmentIndex-1]` + `activeChunkIndexInSegment`. This is the flat index into the `chunks` array that the cursor currently sits in.

### `ui.js` — `renderSplitPreview` active index

Signature becomes `renderSplitPreview(container, chunks, charLimit, activeIndex = -1)`.

- The item at `activeIndex` receives the `.preview-item--active` class (accessed via `container.children[activeIndex]`).
- After all items are appended, call `activeEl?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })`.
- Normal layout call passes no `activeIndex` (no highlight, no scroll).

### `index.html` — focus panel structure

Wrap textarea and new preview panel in `.focus-content`:

```html
<section id="focusModePanel" class="focus-mode hidden">
  <div class="focus-toolbar">...</div>
  <div class="focus-content">
    <textarea id="focusModeText">...</textarea>
    <div class="focus-preview card">
      <h2>Split preview</h2>
      <ul id="focusSplitPreview" class="preview-list"></ul>
    </div>
  </div>
</section>
```

### `styles.css` — layout and active state

`.focus-mode` keeps `grid-template-rows: auto 1fr` (toolbar + content).

```css
.focus-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  overflow: hidden;
}

/* #focusModeText loses max-width: 40rem and margin: 0 auto */
#focusModeText {
  overflow-y: auto;
  /* height fills column via grid */
}

.focus-preview {
  overflow-y: auto;
}

.preview-item--active {
  border-left: 3px solid var(--accent);
  background: color-mix(in oklab, var(--surface-soft), var(--accent) 10%);
}
```

### `main.js` — wire up second preview

- Add `focusSplitPreview: document.getElementById("focusSplitPreview")` to `dom`.
- In `refreshSplitState`, add a second render call:
  ```js
  renderSplitPreview(dom.focusSplitPreview, state.chunks, state.charLimit, state.splitAnalysis.currentChunkIndex);
  ```
- Normal layout call stays unchanged (no active index).

## Data flow

```
textarea input / cursor move
  → refreshSplitState(cursorPosition)
    → analyzeText(text, charLimit, cursorPosition)
        → returns { chunks, currentSplit, currentChunkIndex, ... }
    → renderSplitPreview(dom.splitPreview, chunks, charLimit)          // normal, no highlight
    → renderSplitPreview(dom.focusSplitPreview, chunks, charLimit, currentChunkIndex)  // focus, scrolls active
```

## Out of scope

- Scroll sync in the normal (non-focus) layout — not requested.
- Highlighting in the normal layout split preview.
- Any changes to the publish, auth, or hashtag panels.
