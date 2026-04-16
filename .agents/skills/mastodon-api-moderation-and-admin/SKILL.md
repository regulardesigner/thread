---
name: mastodon-api-moderation-and-admin
description: Plan and implement Mastodon moderation and administration API workflows, including reports triage, account actions, domain-level controls, and audit-safe operational automation. Use when building moderator tooling, admin dashboards, trust-and-safety automations, or investigating moderation API permission issues.
---

# Mastodon API Moderation and Admin

## Overview

Use this skill for moderator and administrator API tasks that require elevated permissions. Validate role and scope prerequisites before executing mutating requests.

## Workflow

1. Confirm actor permissions.
- Verify the account role on the target instance.
- Confirm token scopes include required admin or moderation scopes.
2. Define the operation class.
- Reports intake/triage.
- Account-level moderation action.
- Domain-level action.
- Read-only compliance/audit pull.
3. Select endpoints from the reference map.
4. Execute read-before-write.
- Fetch current state before making mutating calls.
- Record identifiers needed for rollback or follow-up.
5. Apply changes with explicit reason codes and operator trace context.
6. Re-fetch state to verify effect and capture audit output.

## Endpoint Selection

Use [moderation-endpoints.md](references/moderation-endpoints.md) for admin/moderation endpoint categories and guardrails.

Common sequence for reports:
1. `GET /api/v1/admin/reports`
2. `GET /api/v1/admin/reports/:id`
3. Resolve/action endpoint calls per policy

Common sequence for accounts:
1. `GET /api/v1/admin/accounts`
2. `GET /api/v1/admin/accounts/:id`
3. Apply moderation/admin action endpoint

## Implementation Rules

- Separate read and write credentials when possible.
- Enforce policy checks in code before calling write endpoints.
- Require operator attribution and reason text for every write action.
- Prefer reversible actions when policy permits.
- Design batch jobs to be restart-safe and idempotent.

## Output Expectations

When performing moderation/admin work, provide:
- Required scope and role prerequisites.
- Ordered endpoint flow.
- Audit fields to capture.
- Rollback or remediation strategy for failed operations.
