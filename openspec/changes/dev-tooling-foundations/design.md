## Context

The project is a static SPA with a deliberate "no build step" stance: ES modules served directly, no bundler, no TypeScript compilation, no framework. This design exists because the project value is partly in being legible and easy to run (`python3 server.py` and refresh). Any tooling we add must respect that — it can't change how the app is shipped or run.

Today the project has Vitest for unit tests and a small `package.json`, but nothing automates running them. Module boundaries pass implicit object shapes around (the `checkpoint`, `authSession`, `splitAnalysis`, etc.), and the only feedback that callers and callees agree comes from running the app.

## Goals / Non-Goals

**Goals:**
- Tests run automatically on push and PR
- A linter catches a baseline of correctness bugs (unused vars, wrong number of args, accidental globals, mistakes around promises)
- A type checker validates module boundaries against documented shapes
- One command (`npm run check`) reproduces what CI runs
- All additions are dev-time only — runtime bytes shipped to the browser do not change

**Non-Goals:**
- Full TypeScript migration. We stay in JavaScript; types live in JSDoc.
- A bundler, transpiler, or framework. The browser still loads `js/main.js` directly.
- Stylistic lint rules that would generate large diffs (handled by Prettier separately).
- Type-checking DOM-heavy code (`main.js`, `ui.js`). The cost-benefit there is poor — DOM refs are nullable by default and would force pervasive non-null assertions.
- Pre-commit hooks. CI is the enforcement boundary; local hooks are an opinion contributors can adopt individually.

## Decisions

### Decision 1: TypeScript as a checker, not a compiler

Use `typescript` from npm purely for `tsc --noEmit --allowJs --checkJs`. JSDoc annotations carry the types; `tsc` validates them.

**Why:** Preserves the no-build-step ethos — source files in `js/` remain plain JS, browser-loadable as-is. Catches the bugs that matter (calling functions with wrong shapes, accessing `.foo` on something that might be `null`) without forcing a compilation step.

**Alternative considered:** Full `.ts` migration. Rejected because it requires a build step or `tsc` watch loop in dev, breaking the "open file, edit, refresh" model.

**Alternative considered:** No type checking, JSDoc as documentation only. Rejected because untyped JSDoc rots quickly — only enforced types stay correct.

### Decision 2: `// @ts-check` on module boundaries only

Apply `// @ts-check` to: `api.js`, `auth.js`, `publisher.js`, `splitter.js`, `storage.js`, `constants.js`, `continuation.js`, `instances.js`, `hashtags.js`. Skip on `main.js` and `ui.js`.

**Why:** Module boundaries are where shape mismatches actually cause bugs (`publisher` consumes a `checkpoint` from `storage`; both must agree). DOM-touching code in `main.js` and `ui.js` would force `.value!` non-null assertions on every `getElementById` and treat `event.target` as `EventTarget`, which produces low-signal noise.

**Alternative considered:** Apply `// @ts-check` everywhere. Rejected — the noise in DOM code outweighs the benefit and would push contributors to add JSDoc casts that obscure intent.

**Alternative considered:** Use a single `tsconfig.json` with `"checkJs": true` (no per-file directive). Rejected because it's all-or-nothing and we've already decided some files should be excluded; per-file `// @ts-check` makes the scope visible at the top of each file.

### Decision 3: Pragmatic ESLint, Prettier separate

ESLint config inherits `@eslint/js` `recommended` plus a small set of correctness-focused rules (`no-unused-vars`, `no-undef`, `no-await-in-loop` only as a warning, etc.). Style rules off (`indent`, `quotes`, `semi`, `comma-dangle`) — Prettier owns formatting via `eslint-config-prettier` to disable conflicting rules.

**Why:** This is a small, single-author project; bikeshedding over commas is a waste. Prettier's "one way" + ESLint focused on bugs gives the highest signal-to-noise.

**Alternative considered:** ESLint with style rules enabled. Rejected — Prettier handles style better and one tool per concern is simpler.

**Alternative considered:** No ESLint, just Prettier. Rejected — Prettier doesn't catch bugs (unused imports, undeclared variables, wrong arg counts).

### Decision 4: GitHub Actions, single workflow

One workflow, `.github/workflows/ci.yml`, triggered on `push` and `pull_request`. Steps: checkout → setup node → `npm ci` → `npm run check`. Single Node version (LTS, currently 20.x).

**Why:** This is a static frontend project that runs in the browser; matrix testing across Node versions adds latency without insight. One workflow is easy to read and maintain.

**Alternative considered:** Separate workflows per check (lint, typecheck, test). Rejected — three workflow files for a project this size is overkill, and a failed `npm run check` already shows which step failed.

### Decision 5: Shared types live in a JSDoc typedef file

Create `js/modules/types.js` containing only `@typedef` JSDoc blocks (no runtime code, no exports). Modules reference types as `/** @type {import("./types.js").Checkpoint} */`.

**Why:** TypeScript supports this pattern natively. A pure-typedef file is a single source of truth for shared shapes (`AuthSession`, `Checkpoint`, `Account`, `SplitAnalysis`, `FollowedTag`, `ContinuationToot`) and zero bytes ship to the browser if the file isn't imported at runtime — and it isn't.

**Alternative considered:** A `.d.ts` file. Rejected because it introduces a non-JS file into a pure-JS source tree; `// @ts-check` works fine without it.

**Alternative considered:** Inline typedefs in each module that uses them. Rejected — the same shape (e.g., `Checkpoint`) is consumed by `storage`, `publisher`, and `main`; defining it in one place avoids drift.

## Risks / Trade-offs

- **Risk: TypeScript discovers latent bugs that block merge.** → Acceptable; that's the point. If a bug surfaces during the rollout, fix it in the same change.
- **Risk: JSDoc types drift from runtime reality over time.** → Mitigation: `tsc --noEmit` runs in CI, so drift is caught the moment it happens.
- **Risk: Adding ~5 devDependencies inflates `node_modules`.** → Acceptable; these don't ship to users. `package-lock.json` already exists.
- **Risk: Contributors unfamiliar with JSDoc-as-types may misuse the syntax.** → Mitigation: error messages from `tsc` are explicit; the existing module shapes are small enough to learn by example.
- **Trade-off: Skipping `main.js` and `ui.js` from type checking means bugs there go uncaught.** → Accepted. Those modules are mostly DOM glue; the boundary modules (where the real logic lives) carry the types.

## Migration Plan

This is additive — no existing code semantics change. Sequence:

1. Land tooling configs and devDeps first (CI workflow, ESLint, Prettier, tsconfig). At this point CI runs lint and tests only; typecheck is a no-op because no file has `// @ts-check`.
2. Add `js/modules/types.js` with shared typedefs.
3. Add `// @ts-check` to module-boundary files one by one, fixing any errors `tsc` surfaces. Each file is a small, reviewable diff.
4. Run `npm run format` once at the end to apply Prettier across the tree (separate commit so the formatting churn is isolated from logic changes).

Rollback: revert the change. No data, persistence, or runtime behavior is touched.

## Open Questions

- Are there any contributor environments locked to an older Node version? Default assumption: Node 20 LTS is fine. If not, surface during implementation and adjust.
