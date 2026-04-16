# Prompt Log

Chronological entries for incoming requests and prompt intent.

## 2026-04-14T07:26:52Z | User request: create persistent project memory skill
- kind: prompt
- author: codex
- tags: meta,skill,project-memory
- refs: docs/calm-mastodon-thread-publisher-plan-and-implementation.md

### Details
Create a general skill to record prompts, plans, and project learnings/coding preferences so project history is searchable over time.

## 2026-04-14T08:05:29Z | Feature request: choose and persist toot language
- kind: prompt
- author: codex
- tags: feature,language,persistence,mastodon-api
- refs: index.html,js/main.js,js/modules/api.js,js/modules/storage.js,js/modules/publisher.js

### Details
User wants to choose thread language before writing, persist the choice across return visits, and use Mastodon API docs for correct toot language parameter.

## 2026-04-14T08:16:24Z | Bugfix request: language persistence and picker UX
- kind: prompt
- author: codex
- tags: bugfix,language,persistence,ux
- refs: index.html,js/main.js,styles.css,js/modules/storage.js

### Details
User reports language not persisted on reload. Requested default english, specific localized labels, and no visible language code in picker.

## 2026-04-14T08:43:48Z | Feature request: signed-in account confirmation card
- kind: prompt
- author: codex
- tags: feature,auth,ui,profile-card
- refs: index.html,styles.css,js/modules/ui.js,js/main.js

### Details
When connected, replace instance input area with a small account card showing profile picture, username, and a few account infos, with sign-out button nearby.

## 2026-04-14T09:41:10Z | Story planning: help users find their threads
- kind: prompt
- author: codex
- tags: planning,threads,ux,mastodon-api
- refs: docs/calm-mastodon-thread-publisher-plan-and-implementation.md

### Details
User requests brainstorming and implementation plan only (no code) for feature: find my threads.
