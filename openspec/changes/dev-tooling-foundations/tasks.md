## 1. Tooling configuration and dependencies

- [ ] 1.1 Add devDependencies to `package.json`: `eslint`, `@eslint/js`, `globals`, `prettier`, `eslint-config-prettier`, `typescript`
- [ ] 1.2 Add npm scripts to `package.json`: `lint`, `format`, `format:check`, `typecheck`, `check` (aggregate)
- [ ] 1.3 Create `eslint.config.js` (flat config) with `@eslint/js` recommended + correctness rules + `eslint-config-prettier` to disable style conflicts
- [ ] 1.4 Create `.prettierrc` with project formatting choices (verify by running on a sample file)
- [ ] 1.5 Create `.prettierignore` excluding `node_modules`, `package-lock.json`, `.worktrees`, generated artifacts
- [ ] 1.6 Create `tsconfig.json` configured for type checking only: `noEmit: true`, `allowJs: true`, `checkJs: true`, target ES2022, strict where reasonable, include `js/**/*.js`
- [ ] 1.7 Verify `npm run lint` runs without errors against current code (fix any real issues surfaced)
- [ ] 1.8 Verify `npm run typecheck` runs without errors with no `// @ts-check` directives present yet (sanity check)

## 2. Continuous integration

- [ ] 2.1 Create `.github/workflows/ci.yml` triggered on `push` and `pull_request` against `main`
- [ ] 2.2 Workflow steps: checkout → setup Node 20 LTS → `npm ci` → `npm run check`
- [ ] 2.3 Push the branch and open a PR to confirm CI runs and reports status

## 3. Shared types module

- [ ] 3.1 Create `js/modules/types.js` containing only JSDoc `@typedef` blocks (no runtime exports)
- [ ] 3.2 Define typedefs: `AuthSession`, `Account`, `Checkpoint`, `SplitAnalysis`, `FollowedTag`, `ContinuationToot`, `PendingAuth`, `InstanceLimits`, `PublishProgress`, `PublishResult`
- [ ] 3.3 Cross-reference each typedef field against existing usage to confirm shapes match runtime reality

## 4. Apply `// @ts-check` to module-boundary files

- [ ] 4.1 Add `// @ts-check` to `js/modules/constants.js` and resolve any errors
- [ ] 4.2 Add `// @ts-check` to `js/modules/storage.js`, annotate function signatures with JSDoc referencing `types.js`, resolve errors
- [ ] 4.3 Add `// @ts-check` to `js/modules/api.js`, annotate function signatures, resolve errors
- [ ] 4.4 Add `// @ts-check` to `js/modules/auth.js`, annotate function signatures, resolve errors
- [ ] 4.5 Add `// @ts-check` to `js/modules/splitter.js`, annotate function signatures, resolve errors
- [ ] 4.6 Add `// @ts-check` to `js/modules/publisher.js`, annotate function signatures, resolve errors
- [ ] 4.7 Add `// @ts-check` to `js/modules/continuation.js`, annotate function signatures, resolve errors
- [ ] 4.8 Add `// @ts-check` to `js/modules/instances.js`, annotate function signatures, resolve errors
- [ ] 4.9 Add `// @ts-check` to `js/modules/hashtags.js`, annotate function signatures, resolve errors
- [ ] 4.10 Confirm `js/main.js` and `js/modules/ui.js` do NOT have `// @ts-check`

## 5. Final formatting pass and verification

- [ ] 5.1 Run `npm run format` once to apply Prettier across the tree (separate commit isolating formatting churn)
- [ ] 5.2 Run `npm run check` end-to-end and confirm clean exit
- [ ] 5.3 Open the app in a browser and verify it still loads and signs in correctly (sanity check that no runtime path was disturbed)
- [ ] 5.4 Confirm CI passes on the PR
