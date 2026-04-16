# Project Memory

This folder stores durable memory for the project so work history is searchable and reusable over time.

## Files

- `prompt-log.md`: Incoming prompts and normalized request statements.
- `plan-log.md`: Proposed execution plans before implementation.
- `result-log.md`: Delivery summaries with what changed and what was verified.
- `learning-log.md`: Reusable lessons and coding preferences.
- `activity-log.md`: Global chronological index of all entries.

## Logging Command

Use:

```bash
bash .agents/skills/project-memory-journal/scripts/log_entry.sh --kind <prompt|plan|result|learning> --title "<title>" --content "<details>"
```

## Search Examples

```bash
rg -n "oauth|timeline|bug" docs/project-memory
cat docs/project-memory/activity-log.md
```
