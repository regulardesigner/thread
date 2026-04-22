## Requirements

### Requirement: Instance input shows filtered suggestions while typing
When the user types in an instance domain input, the system SHALL display a dropdown list of matching well-known instances filtered by the current input value (case-insensitive substring match on domain name).

#### Scenario: User types a partial domain
- **WHEN** the user types "social" in an instance input
- **THEN** a dropdown appears below the input listing domains that contain "social" (e.g., mastodon.social)

#### Scenario: No matches found
- **WHEN** the user types a string that matches no known instance
- **THEN** the dropdown is hidden

#### Scenario: Input is empty
- **WHEN** the instance input is empty
- **THEN** no dropdown is shown

### Requirement: Suggestion can be selected by click
The system SHALL populate the instance input with the selected domain and close the dropdown when the user clicks a suggestion.

#### Scenario: User clicks a suggestion
- **WHEN** a suggestion is visible in the dropdown and the user clicks it
- **THEN** the instance input value is set to the clicked domain
- **AND** the dropdown is hidden

### Requirement: Suggestion can be selected by keyboard
The system SHALL support keyboard navigation within the dropdown: arrow keys move the highlight, Enter selects the highlighted item, Escape closes the dropdown without selecting.

#### Scenario: User navigates with arrow keys
- **WHEN** the dropdown is open and the user presses ArrowDown
- **THEN** the first suggestion becomes highlighted
- **AND** subsequent ArrowDown presses move the highlight down

#### Scenario: User presses Enter on a highlighted item
- **WHEN** a suggestion is highlighted and the user presses Enter
- **THEN** the input value is set to the highlighted domain
- **AND** the dropdown is hidden

#### Scenario: User presses Escape
- **WHEN** the dropdown is open and the user presses Escape
- **THEN** the dropdown is hidden without changing the input value

### Requirement: Dropdown closes on outside interaction
The system SHALL close the dropdown when the user clicks outside the input or dropdown, or moves focus away from the input.

#### Scenario: User clicks outside
- **WHEN** the dropdown is open and the user clicks anywhere outside the input and dropdown
- **THEN** the dropdown is hidden

#### Scenario: User tabs away from input
- **WHEN** the dropdown is open and the user moves focus away from the instance input
- **THEN** the dropdown is hidden

### Requirement: Both instance inputs have autocomplete
The autocomplete behavior SHALL apply to both the landing page instance input and the composer auth card instance input.

#### Scenario: Landing page input
- **WHEN** the user types in the landing page instance input
- **THEN** a suggestion dropdown appears below that input

#### Scenario: Composer auth card input
- **WHEN** the user types in the composer auth card instance input
- **THEN** a suggestion dropdown appears below that input

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
