## ADDED Requirements

### Requirement: Unlisted instance shows typed value as selectable option
When the user has typed a non-empty value that matches no known instances, the system SHALL display the typed value as the sole option in the dropdown, allowing the user to confirm and proceed with any valid Mastodon instance domain.

#### Scenario: User types an unlisted domain
- **WHEN** the user types a domain (e.g., "myinstance.xyz") that matches no known instances in the list
- **THEN** the dropdown displays the typed domain as a single selectable option
- **AND** the option is visually distinct from regular suggestions (e.g., muted style or custom prefix)

#### Scenario: User selects the unlisted domain option
- **WHEN** the unlisted domain option is displayed and the user clicks or presses Enter on it
- **THEN** the input value is set to the typed domain
- **AND** the dropdown is hidden

#### Scenario: Typed value is empty — no custom option shown
- **WHEN** the instance input is empty
- **THEN** no dropdown is shown (including no custom option)

#### Scenario: Known matches exist — no custom option shown
- **WHEN** the typed value matches one or more known instances
- **THEN** only the matching known instances are shown in the dropdown
- **AND** the typed value is NOT shown as an additional custom option
