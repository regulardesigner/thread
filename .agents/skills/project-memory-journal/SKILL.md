---
name: project-memory-journal
description: Maintain a durable project memory journal by recording every incoming prompt, implementation plan, execution result, and coding preferences or lessons in docs/project-memory. Use for any request in this repository (new features, bug fixes, refactors, reviews, docs, or maintenance) when Codex should preserve full project traceability and improve delivery quality over time.
---

# Project Memory Journal

Use this skill to keep a complete, searchable record of what was requested, what was planned, what was delivered, and what was learned.

## Workflow

1. Record the incoming user request immediately.
2. Save the implementation plan before making substantial edits.
3. Record the execution result after implementation and verification.
4. Capture learnings and coding preferences from the task outcome.
5. Keep sensitive values redacted in logs.

## Command

Use the bundled script:

```bash
bash .agents/skills/project-memory-journal/scripts/log_entry.sh \
  --kind prompt \
  --title "Short request summary" \
  --content "Original user prompt text"
```

Supported kinds: `prompt`, `plan`, `result`, `learning`.

## Required Logging Rules

- For every task, write at least one `prompt` entry and one `result` entry.
- When a plan exists, write a `plan` entry before implementation begins.
- Write a `learning` entry after completion with:
  - reusable technical lessons
  - stable coding preferences observed from the user
  - anti-patterns to avoid next time
- Keep entries concise and specific, with file references when relevant.

## Journal Files

- `docs/project-memory/prompt-log.md`
- `docs/project-memory/plan-log.md`
- `docs/project-memory/result-log.md`
- `docs/project-memory/learning-log.md`
- `docs/project-memory/activity-log.md`

## References

- [logging-workflow.md](references/logging-workflow.md)
