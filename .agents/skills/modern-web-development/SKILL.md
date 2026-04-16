---
name: modern-web-development
description: Build and maintain modern web interfaces using standard HTML, CSS, and JavaScript without framework lock-in. Use when implementing responsive pages, reusable UI components, client-side state, form flows, performance/accessibility improvements, or browser-compatibility fixes in vanilla web projects.
---

# Modern Web Development

## Overview

Use this skill for production-quality front-end work with standard HTML, CSS, and JavaScript. Prefer maintainable structure, strong accessibility, and measurable performance over quick one-off hacks.

## Core Workflow

1. Clarify page goals and user flows.
2. Define semantic HTML structure first.
3. Design a CSS token system (colors, spacing, typography, radius, shadow, motion).
4. Implement progressive JavaScript behavior on top of accessible markup.
5. Validate responsiveness, keyboard navigation, and screen-reader behavior.
6. Optimize loading path and interaction performance.

## Implementation Standards

- Use semantic elements and meaningful landmark structure.
- Keep CSS organized by layers: reset/base, tokens, layout, components, utilities.
- Use CSS custom properties for design tokens.
- Prefer mobile-first breakpoints and container-aware layouts.
- Avoid global side effects in JavaScript; isolate modules by feature.
- Use event delegation for repeated interactive elements.
- Fail gracefully when JS is disabled or network calls fail.

## UX and Accessibility Rules

- Ensure keyboard operability for all interactive controls.
- Preserve clear focus styles and logical tab order.
- Pair form controls with labels and helpful validation messaging.
- Meet contrast requirements and avoid color-only status indicators.
- Respect reduced-motion preferences.

## Performance Rules

- Minimize layout shift and expensive DOM churn.
- Defer non-critical scripts.
- Keep bundles small and avoid unnecessary dependencies.
- Use responsive images and lazy loading where appropriate.
- Measure impact with browser devtools before and after optimization.

## Deliverables

When executing work with this skill, provide:
- Updated semantic HTML structure.
- CSS architecture and token decisions.
- JavaScript module boundaries and event/data flow.
- Accessibility checks performed.
- Performance changes and expected impact.

## References

- [html-css-js-standards.md](references/html-css-js-standards.md)
- [frontend-review-checklist.md](references/frontend-review-checklist.md)
