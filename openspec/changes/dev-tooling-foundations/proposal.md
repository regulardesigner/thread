## Why

The project has tests but nothing runs them on push or PR, no lint catches obvious bugs before they merge, and module boundaries pass implicit object shapes (`authSession`, `checkpoint`, `splitAnalysis`) with no enforcement that callers and callees agree. As the codebase grows past ~2700 LOC, these gaps compound into surprises that should be caught automatically.

Establishing this baseline now — while the project is small enough that the cleanup is cheap — preserves the no-build-step ethos (no bundler, no TypeScript compilation, no framework) while raising the floor on what's caught before review.

## What Changes

- Add a GitHub Actions workflow that runs `npm test` on push and pull requests
- Add an ESLint flat-config setup tuned for vanilla ES modules (pragmatic — bug-catching rules, not stylistic ones)
- Add Prettier with a project config so style is settled separately from lint
- Add `typescript` as a devDependency used purely as a type-checker via `tsc --noEmit --allowJs --checkJs`
- Add JSDoc typedefs for shared shapes (`AuthSession`, `Account`, `Checkpoint`, `SplitAnalysis`, `FollowedTag`, `ContinuationToot`) and apply `// @ts-check` to the module boundary files: `api.js`, `auth.js`, `publisher.js`, `splitter.js`, `storage.js`, `constants.js`, `continuation.js`, `instances.js`, `hashtags.js`
- Skip `// @ts-check` on `main.js` and `ui.js` (DOM-heavy; nullable element refs would create noise that outweighs the benefit)
- Add npm scripts: `lint`, `format`, `format:check`, `typecheck`, and a `check` aggregate that runs lint + typecheck + test

## Capabilities

### New Capabilities
- `dev-tooling`: project-level requirements for continuous integration, linting, formatting, and type checking — what must run, where, and which files are in scope

### Modified Capabilities
<!-- None: existing capabilities (auth, instance-autocomplete, landing-page, theme) describe runtime behavior and are not affected. -->

## Impact

- **New files**: `.github/workflows/ci.yml`, `eslint.config.js`, `.prettierrc`, `.prettierignore`, `tsconfig.json` (used only for type checking, not compilation), JSDoc typedef block in a shared location (likely `js/modules/types.js` re-exporting nothing, or inline per module)
- **Modified files**: `package.json` (devDependencies + scripts), every `js/modules/*.js` file gaining `// @ts-check` and JSDoc annotations on exported functions
- **No runtime impact**: the published bundle remains unchanged — all additions are dev-time only
- **New devDependencies**: `eslint`, `@eslint/js`, `globals`, `prettier`, `eslint-config-prettier`, `typescript`
- **Contributor workflow**: PRs that fail lint, typecheck, or tests will be flagged by CI; contributors should be able to run `npm run check` locally to reproduce
