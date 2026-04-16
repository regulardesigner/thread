# Focus Mode Split Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show the split preview panel to the right of the writing area in focus mode (2/3 + 1/3), with the current toot automatically scrolled into view as the cursor moves.

**Architecture:** Add `currentChunkIndex` to `analyzeText`'s return value, then pass it to a second `renderSplitPreview` call targeting a new `#focusSplitPreview` element inside the focus mode panel. The focus mode layout becomes a two-column grid. No new state, no new events.

**Tech Stack:** Vanilla HTML/CSS/JavaScript (ES6 modules). No build step, no test framework — verification is browser-based.

**User Verification:** NO — this is a UI feature verified by the developer opening the browser.

---

## File Map

| File | Change |
|---|---|
| `js/modules/splitter.js` | Add `currentChunkIndex` to `analyzeText` return value |
| `js/modules/ui.js` | Add `activeIndex` param to `renderSplitPreview`, highlight + scroll active item |
| `index.html` | Wrap focus textarea in `.focus-content`, add `#focusSplitPreview` element |
| `styles.css` | Add `.focus-content`, `.focus-preview`, `.preview-item--active`, update `#focusModeText` |
| `js/main.js` | Add `focusSplitPreview` to `dom`, pass `currentChunkIndex` in focus render call |

---

### Task 1: Add `currentChunkIndex` to `analyzeText`

**Goal:** `analyzeText` returns the flat index of the chunk the cursor is currently in.

**Files:**
- Modify: `js/modules/splitter.js`

**Acceptance Criteria:**
- [ ] `analyzeText` return value includes `currentChunkIndex` (number, 0-based)
- [ ] Cursor at start of text returns `0`
- [ ] Cursor past first 500 chars (with 500-char limit) returns `1`
- [ ] Cursor in second manual segment returns the correct flat index

**Verify:** Open browser console, run:
```js
import('/js/modules/splitter.js').then(m => {
  console.log(m.analyzeText('a'.repeat(600), 500, 550).currentChunkIndex); // expect 1
  console.log(m.analyzeText('hello\n---\nworld', 500, 10).currentChunkIndex); // expect 0
  console.log(m.analyzeText('hello\n---\nworld', 500, 12).currentChunkIndex); // expect 1
});
```

**Steps:**

- [ ] **Step 1: Open `js/modules/splitter.js` and locate the block after `chunksPerSegment` is built (around line 79). Add the `currentChunkIndex` computation before the `return` statement:**

```js
// Find the index of the active raw segment within filteredSegments
const filteredActiveSegmentIndex = filteredSegments.findIndex(
  (seg) => seg.start === manualSegments[activeRawSegmentIndex].start
);

// Sum chunk counts from all preceding filtered segments, then add in-segment offset
let currentChunkIndex = 0;
if (filteredActiveSegmentIndex >= 0) {
  for (let i = 0; i < filteredActiveSegmentIndex; i++) {
    currentChunkIndex += chunksPerSegment[i];
  }
  currentChunkIndex += activeChunkIndexInSegment;
}
```

- [ ] **Step 2: Add `currentChunkIndex` to the `return` object (the existing return starts at line 108):**

```js
return {
  chunks,
  manualSegmentsCount: manualSegments.length,
  hasManualSplit: manualSegments.length > 1,
  currentChunkIndex,
  currentSplit: {
    length: activeChunkLength,
    limit: normalizedLimit,
    segmentIndex: activeRawSegmentIndex + 1,
    tootIndexInSegment: activeChunkIndexInSegment + 1,
  },
};
```

- [ ] **Step 3: Verify in browser console** using the commands from the Verify section above. All three should return expected values.

- [ ] **Step 4: Commit**

```bash
git add js/modules/splitter.js
git commit -m "feat: add currentChunkIndex to analyzeText return value"
```

```json:metadata
{"files": ["js/modules/splitter.js"], "verifyCommand": "browser console", "acceptanceCriteria": ["currentChunkIndex present in analyzeText return", "correct index for single segment", "correct index for multi-segment"], "requiresUserVerification": false}
```

---

### Task 2: Update `renderSplitPreview` to support active index

**Goal:** `renderSplitPreview` accepts an optional `activeIndex`, applies `.preview-item--active` to that item, and scrolls it into view.

**Files:**
- Modify: `js/modules/ui.js`

**Acceptance Criteria:**
- [ ] Calling `renderSplitPreview(container, chunks, charLimit)` still works (no regression)
- [ ] Calling with `activeIndex=1` marks the second `<li>` with `preview-item--active`
- [ ] The active item calls `scrollIntoView({ block: 'nearest', behavior: 'smooth' })`
- [ ] `activeIndex=-1` (default) marks nothing and does not scroll

**Verify:** Load the app in the browser, open DevTools, inspect the `#splitPreview` list — no items should have `preview-item--active` (normal mode passes no active index). Enter focus mode and type — the corresponding item in the focus preview (once Task 3+4 are done) should have the class.

**Steps:**

- [ ] **Step 1: Update the `renderSplitPreview` function signature and body in `js/modules/ui.js`. Replace the entire function (lines 83–116) with:**

```js
export function renderSplitPreview(container, chunks, charLimit, activeIndex = -1) {
  container.innerHTML = "";

  if (!chunks.length) {
    const empty = document.createElement("li");
    empty.className = "preview-item muted";
    empty.textContent = "Write text to generate toot preview.";
    container.append(empty);
    return;
  }

  chunks.forEach((chunk, index) => {
    const item = document.createElement("li");
    item.className = "preview-item";
    if (index === activeIndex) {
      item.classList.add("preview-item--active");
    }

    const meta = document.createElement("div");
    meta.className = "preview-meta";

    const label = document.createElement("span");
    label.textContent = `Toot ${index + 1}`;

    const count = document.createElement("span");
    count.textContent = `${chunk.length}/${charLimit}`;

    meta.append(label, count);

    const text = document.createElement("p");
    text.className = "preview-text";
    text.textContent = chunk;

    item.append(meta, text);
    container.append(item);
  });

  const activeEl = container.children[activeIndex];
  activeEl?.scrollIntoView({ block: "nearest", behavior: "smooth" });
}
```

- [ ] **Step 2: Reload the browser. The normal split preview should still render correctly. No visual change expected yet** (normal mode doesn't pass `activeIndex`).

- [ ] **Step 3: Commit**

```bash
git add js/modules/ui.js
git commit -m "feat: add activeIndex support to renderSplitPreview with scroll-into-view"
```

```json:metadata
{"files": ["js/modules/ui.js"], "verifyCommand": "browser inspect", "acceptanceCriteria": ["renderSplitPreview works without activeIndex", "preview-item--active class applied at activeIndex", "scrollIntoView called on active element"], "requiresUserVerification": false}
```

---

### Task 3: Add focus preview panel to HTML and CSS

**Goal:** Focus mode shows a two-column layout: writing area (2/3) + split preview panel (1/3).

**Files:**
- Modify: `index.html`
- Modify: `styles.css`

**Acceptance Criteria:**
- [ ] Focus mode shows two columns side by side
- [ ] Writing textarea is in the left column, preview panel in the right column
- [ ] Each column scrolls independently
- [ ] `.preview-item--active` has a visible left accent border and light background
- [ ] `#focusModeText` still fills its column fully (no max-width centering)

**Verify:** `npm start`, click "Focus mode", type some text longer than 500 chars — the preview panel should appear on the right with toot cards. Scroll the preview to confirm it scrolls independently.

**Steps:**

- [ ] **Step 1: In `index.html`, replace the `<section id="focusModePanel">` block (lines 137–149) with:**

```html
<section id="focusModePanel" class="focus-mode hidden" aria-label="Focus writing mode">
  <div class="focus-toolbar">
    <strong>Focus writing</strong>
    <span id="focusCurrentSplitCount" class="muted">Current toot: 0/500</span>
    <button id="focusModeExitButton" type="button" class="secondary">Exit focus mode</button>
  </div>
  <div class="focus-content">
    <textarea
      id="focusModeText"
      rows="20"
      placeholder="Write your thread here... Use --- on its own line to split manually."
      spellcheck="true"
    ></textarea>
    <div class="focus-preview card">
      <h2>Split preview</h2>
      <ul id="focusSplitPreview" class="preview-list"></ul>
    </div>
  </div>
</section>
```

- [ ] **Step 2: In `styles.css`, replace the `#focusModeText` rule (lines 378–387) with the updated version that removes max-width centering:**

```css
#focusModeText {
  width: 100%;
  min-height: 100%;
  resize: none;
  font-size: 1.08rem;
  line-height: 1.6;
  padding: 1rem;
  overflow-y: auto;
}
```

- [ ] **Step 3: In `styles.css`, add the following new rules after the `.focus-mode` block (after line 369):**

```css
.focus-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  overflow: hidden;
}

.focus-preview {
  overflow-y: auto;
}

.preview-item--active {
  border-left: 3px solid var(--accent);
  background: color-mix(in oklab, var(--surface-soft), var(--accent) 10%);
}
```

- [ ] **Step 4: Reload the browser and click "Focus mode". Confirm the two-column layout appears. The right panel will show "Write text to generate toot preview." until wired up in Task 4.**

- [ ] **Step 5: Commit**

```bash
git add index.html styles.css
git commit -m "feat: add focus mode split preview panel with two-column layout"
```

```json:metadata
{"files": ["index.html", "styles.css"], "verifyCommand": "npm start + browser", "acceptanceCriteria": ["focus mode shows two columns", "columns scroll independently", "preview-item--active styled correctly", "focusModeText fills its column"], "requiresUserVerification": false}
```

---

### Task 4: Wire up focus preview in `main.js`

**Goal:** The focus preview panel renders live toot splits and scrolls the active toot into view as the cursor moves.

**Files:**
- Modify: `js/main.js`

**Acceptance Criteria:**
- [ ] `dom.focusSplitPreview` resolves to the `<ul id="focusSplitPreview">` element
- [ ] Typing in focus mode updates both `#splitPreview` and `#focusSplitPreview`
- [ ] The active toot in `#focusSplitPreview` receives `.preview-item--active` and scrolls into view
- [ ] Moving the cursor to a different toot updates the highlighted item

**Verify:** `npm start`, enter focus mode, paste text longer than 1000 chars. Move cursor between toots — the highlighted item in the right panel should change and scroll into view.

**Steps:**

- [ ] **Step 1: In `js/main.js`, add `focusSplitPreview` to the `dom` object (after line 68, inside the object literal):**

```js
focusSplitPreview: document.getElementById("focusSplitPreview"),
```

- [ ] **Step 2: In `refreshSplitState` (around line 124), the current call is:**

```js
renderSplitPreview(dom.splitPreview, state.chunks, state.charLimit);
```

Add a second call immediately after it:

```js
renderSplitPreview(dom.splitPreview, state.chunks, state.charLimit);
renderSplitPreview(dom.focusSplitPreview, state.chunks, state.charLimit, state.splitAnalysis.currentChunkIndex);
```

- [ ] **Step 3: Reload and test end-to-end:**
  1. Click "Focus mode"
  2. Paste `'a'.repeat(1200)` into the textarea (type or paste)
  3. Move cursor to start — toot 1 should be highlighted in the right panel
  4. Move cursor past character 500 — toot 2 should be highlighted and scrolled into view
  5. Move cursor past character 1000 — toot 3 should be highlighted and scrolled into view
  6. Exit focus mode — normal layout unaffected, no `.preview-item--active` in `#splitPreview`

- [ ] **Step 4: Commit**

```bash
git add js/main.js
git commit -m "feat: wire up focus mode split preview with active toot scroll"
```

```json:metadata
{"files": ["js/main.js"], "verifyCommand": "npm start + browser end-to-end", "acceptanceCriteria": ["focusSplitPreview renders on input", "active toot highlighted in focus mode", "active toot scrolls into view on cursor move", "normal layout unaffected"], "requiresUserVerification": false}
```
