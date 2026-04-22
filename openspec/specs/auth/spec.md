## Requirements

### Requirement: Sign-in form placement
The sign-in form (instance domain input + sign-in button) SHALL be rendered within the landing page layout rather than as a standalone card inside the composer shell. The composer's internal auth card SHALL not be shown when the landing page is active.

#### Scenario: Signed-out user sees sign-in form
- **WHEN** no auth session exists
- **THEN** the sign-in form is visible inside the landing page
- **AND** no duplicate auth card appears inside the composer shell

#### Scenario: Signed-in user does not see landing page sign-in form
- **WHEN** an active auth session exists
- **THEN** the landing page is hidden entirely
- **AND** the signed-in account card is shown inside the composer shell as before
