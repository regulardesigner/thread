## Requirements

### Requirement: Landing page displays when user is not authenticated
The system SHALL display a landing page as the primary screen when no active auth session exists. The composer UI SHALL be hidden.

#### Scenario: Unauthenticated user visits the app
- **WHEN** a user opens the app with no active session in sessionStorage
- **THEN** the landing page section is visible
- **AND** the composer `.app-shell` is hidden

#### Scenario: User completes sign-in
- **WHEN** the OAuth PKCE flow completes and `state.authSession` is set
- **THEN** the landing page is hidden
- **AND** the composer is shown

### Requirement: Landing page explains the project
The landing page SHALL include the project name, a one-line tagline, and a short list of key feature highlights so that a new visitor understands what the app does before signing in.

#### Scenario: First-time visitor reads the page
- **WHEN** the landing page is displayed
- **THEN** the project name "Calm Thread Publisher" is visible
- **AND** a tagline describing the core value is visible
- **AND** at least three feature highlights are listed

### Requirement: Landing page provides a single sign-in entry point
The landing page SHALL contain an instance-domain input and a "Sign in with Mastodon" button as the sole call-to-action. No other primary actions SHALL be present.

#### Scenario: User enters instance domain and clicks sign in
- **WHEN** the user types their Mastodon instance domain (e.g., `mastodon.social`) and clicks "Sign in with Mastodon"
- **THEN** the OAuth PKCE flow initiates (same behavior as the existing auth form)

#### Scenario: User submits empty instance domain
- **WHEN** the user clicks "Sign in with Mastodon" with an empty instance input
- **THEN** the sign-in does not proceed
- **AND** an appropriate validation message is shown

### Requirement: Landing page instance input supports autocomplete
The instance domain input on the landing page SHALL display filtered instance suggestions as the user types, consistent with the instance-autocomplete capability.

#### Scenario: User types in landing page instance input
- **WHEN** the user types a partial domain in the landing page instance input
- **THEN** a suggestion dropdown appears below the input with matching known instances

### Requirement: Landing page is responsive
The landing page SHALL use a two-column layout on wide viewports and collapse to a single column on narrow viewports (≤ 960px), with the sign-in form below the feature copy.

#### Scenario: Wide viewport
- **WHEN** the viewport is wider than 960px
- **THEN** feature copy and sign-in form are side by side

#### Scenario: Narrow viewport
- **WHEN** the viewport is 960px wide or narrower
- **THEN** feature copy and sign-in form stack vertically
