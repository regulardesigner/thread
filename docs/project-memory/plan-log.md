# Plan Log

Chronological entries for implementation plans.

## 2026-04-14T07:26:52Z | Plan: implement project-memory-journal skill and persistent logs
- kind: plan
- author: codex
- tags: plan,implementation

### Details
1) Create a new skill folder in .agents/skills. 2) Add SKILL.md with broad trigger coverage for all repo tasks. 3) Add a reusable logging script for prompt/plan/result/learning entries. 4) Add docs/project-memory logs and README. 5) Validate by writing entries for this task.

## 2026-04-14T08:05:29Z | Plan: add toot language selector with persistence and publish integration
- kind: plan
- author: codex
- tags: plan,frontend,api,storage

### Details
1) Add a composer language input (ISO 639-1) with quick-pick datalist. 2) Persist selected language in localStorage and hydrate on init. 3) Pass language through publish pipeline/checkpoint and include it in POST /api/v1/statuses as language. 4) Validate input and keep recovery/resume using same language. 5) Verify by static inspection and update result/learning logs.

## 2026-04-14T08:16:24Z | Plan: replace language input with select and enforce default en
- kind: plan
- author: codex
- tags: plan,bugfix,frontend

### Details
1) Replace datalist input with select options using localized labels. 2) Keep values as ISO codes but display only labels. 3) On init load saved language and fallback to en. 4) Persist on change and normalize invalid values back to en. 5) Syntax-check JS.

## 2026-04-14T08:43:48Z | Plan: swap auth form for signed-in profile card
- kind: plan
- author: codex
- tags: plan,frontend,auth

### Details
1) Split auth UI into signed-out panel (existing form) and signed-in panel (profile card + sign out). 2) Add DOM fields for avatar/name/handle/instance/stats. 3) Update renderAuthState to toggle panels and populate account data. 4) Add card styles and responsive layout. 5) Run syntax checks.

## 2026-04-14T09:41:10Z | Plan draft: my threads discovery feature
- kind: plan
- author: codex
- tags: plan,threads,api,product

### Details
Prepare product questions, evaluate API discovery options (account statuses + status context + optional conversations for direct), define data model and phased rollout (MVP local history then server sync), and provide acceptance criteria without coding.
