# Logging Workflow

Use this guide with `project-memory-journal` to keep project memory accurate.

## Entry Order

1. `prompt`
2. `plan`
3. `result`
4. `learning`

## Recommended Commands

Log incoming request:

```bash
bash .agents/skills/project-memory-journal/scripts/log_entry.sh \
  --kind prompt \
  --title "Feature: compose thread preview" \
  --content "Add an inline preview panel for the thread composer."
```

Log plan:

```bash
bash .agents/skills/project-memory-journal/scripts/log_entry.sh \
  --kind plan \
  --title "Plan: thread preview panel" \
  --content "- Add preview component\n- Wire composer state\n- Add responsive styles\n- Verify on mobile"
```

Log result:

```bash
bash .agents/skills/project-memory-journal/scripts/log_entry.sh \
  --kind result \
  --title "Result: thread preview panel delivered" \
  --content "Implemented preview component, connected state, and verified UI behavior."
```

Log learning:

```bash
bash .agents/skills/project-memory-journal/scripts/log_entry.sh \
  --kind learning \
  --title "Learning: prefer deterministic publish state machine" \
  --content "Keep publish states explicit (idle/validating/publishing/failed/completed) to simplify retries."
```

## Search and Audit

Search prompts by keyword:

```bash
rg -n "oauth|bug|timeline|publish" docs/project-memory/prompt-log.md
```

Search all logs for a feature name:

```bash
rg -n "thread preview panel" docs/project-memory
```

List chronological activity:

```bash
cat docs/project-memory/activity-log.md
```
