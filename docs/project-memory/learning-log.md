# Learning Log

Chronological entries for lessons learned and coding preferences.

## 2026-04-14T07:26:52Z | Learning: persistent memory works best with strict per-task logging
- kind: learning
- author: codex
- tags: process,quality

### Details
Require at least one prompt and one result entry per task. Add plan entries before substantial edits. Capture stable coding preferences as explicit bullets so future tasks can reuse them quickly.

## 2026-04-14T08:07:01Z | Learning: keep status metadata in checkpoint for reliable recovery
- kind: learning
- author: codex
- tags: learning,publisher,recovery

### Details
When introducing per-thread publish metadata (like language), store it in checkpoint at publish start. This guarantees retry/manual next operations remain consistent even if UI settings change mid-recovery.

## 2026-04-14T08:17:17Z | Learning: use select for stable persisted settings
- kind: learning
- author: codex
- tags: learning,frontend,forms

### Details
For constrained settings (like language), a select avoids invalid values and reduces persistence bugs compared to free-text + datalist inputs.

## 2026-04-14T08:46:19Z | Learning: panel-level auth rendering is cleaner than per-button toggles
- kind: learning
- author: codex
- tags: learning,frontend,state-management

### Details
For auth UI states, toggling whole signed-out/signed-in containers simplifies logic and avoids mixed intermediate states compared with toggling individual controls.

## 2026-04-14T09:41:29Z | Learning: thread discovery needs explicit product definition
- kind: learning
- author: codex
- tags: learning,product,api-design

### Details
Mastodon has no single 'my threads' endpoint, so product semantics (all threads vs app-created threads, visibility scope, cross-device behavior) must be decided before implementation to avoid unstable heuristics.
