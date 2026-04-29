## ADDED Requirements

### Requirement: Continuous integration runs the project checks

The project SHALL provide a GitHub Actions workflow that runs lint, type checking, and unit tests on every push to `main` and on every pull request targeting `main`. The workflow MUST fail the build if any of these checks fail.

#### Scenario: Pull request runs CI
- **WHEN** a pull request is opened or updated against `main`
- **THEN** the CI workflow executes lint, typecheck, and tests
- **AND** the workflow fails if any step exits non-zero

#### Scenario: Push to main runs CI
- **WHEN** a commit is pushed directly to `main`
- **THEN** the CI workflow executes lint, typecheck, and tests
- **AND** the workflow fails if any step exits non-zero

#### Scenario: Local reproduction
- **WHEN** a contributor runs `npm run check` locally
- **THEN** the same lint, typecheck, and test commands execute that CI runs

### Requirement: Code is linted with ESLint

The project SHALL use ESLint with a flat-config (`eslint.config.js`) configured for vanilla ES modules. The configuration SHALL focus on correctness rules (unused variables, undeclared identifiers, incorrect promise handling) rather than stylistic rules. Stylistic concerns SHALL be handled by Prettier; `eslint-config-prettier` MUST be applied to disable any ESLint rules that conflict with Prettier.

#### Scenario: Lint catches a real bug
- **WHEN** code is committed that references an undeclared variable, has an unused import, or contains an unused function parameter
- **THEN** `npm run lint` reports an error
- **AND** CI fails

#### Scenario: Lint does not bikeshed style
- **WHEN** Prettier-formatted code is linted
- **THEN** ESLint does not report stylistic violations (quotes, semicolons, trailing commas, indentation)

### Requirement: Code is formatted with Prettier

The project SHALL use Prettier with a project-level config (`.prettierrc`) and a `.prettierignore` excluding `node_modules`, `package-lock.json`, and any generated artifacts. Two npm scripts SHALL be exposed: `format` (writes changes) and `format:check` (read-only, fails if any file would change).

#### Scenario: Formatting check in CI
- **WHEN** `npm run format:check` is run on a tree with unformatted files
- **THEN** the command exits non-zero and lists the offending files

#### Scenario: Applying formatting locally
- **WHEN** a contributor runs `npm run format`
- **THEN** all source files are rewritten to match the Prettier config

### Requirement: Module boundaries are type-checked via JSDoc

The project SHALL use TypeScript as a JSDoc-aware type checker (`tsc --noEmit --allowJs --checkJs`) with no compilation output. Source files remain `.js` and browser-loadable without a build step. The following files SHALL include the `// @ts-check` directive at the top: `api.js`, `auth.js`, `publisher.js`, `splitter.js`, `storage.js`, `constants.js`, `continuation.js`, `instances.js`, `hashtags.js`. The following files SHALL NOT include the directive: `main.js`, `ui.js`.

#### Scenario: Boundary file has a type error
- **WHEN** a function in `publisher.js` is called with an argument whose JSDoc-declared shape does not match
- **THEN** `npm run typecheck` reports the type error
- **AND** CI fails

#### Scenario: DOM glue is exempt
- **WHEN** `main.js` or `ui.js` accesses a DOM ref without a non-null assertion
- **THEN** `npm run typecheck` does not report an error in those files

#### Scenario: Shared shapes are referenced from one place
- **WHEN** multiple modules consume the same shape (e.g., `Checkpoint`, `AuthSession`)
- **THEN** the typedef is defined once in `js/modules/types.js`
- **AND** consuming modules reference it via `import("./types.js").<TypeName>`

### Requirement: Runtime bundle is unaffected by tooling

The tooling additions SHALL be dev-time only. No bundler, transpiler, or generated file SHALL be introduced into the runtime path. The browser SHALL continue to load `js/main.js` as a native ES module via `<script type="module">` exactly as before.

#### Scenario: Production load path unchanged
- **WHEN** the app is opened in a browser
- **THEN** the same `index.html` and the same `js/` source files are served as before this change
- **AND** no transpiled, minified, or generated artifact is loaded

### Requirement: A single command runs all project checks

The project SHALL expose `npm run check` as an aggregate that runs lint, typecheck, and tests in sequence and exits non-zero if any step fails. This script SHALL be the canonical local reproduction of CI behavior.

#### Scenario: Aggregate passes
- **WHEN** `npm run check` is run on a clean tree
- **THEN** lint, typecheck, and test commands run in sequence
- **AND** the command exits zero if all pass
