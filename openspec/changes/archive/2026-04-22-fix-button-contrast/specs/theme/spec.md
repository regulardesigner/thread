## MODIFIED Requirements

### Requirement: Error and danger states use red
The system SHALL use red (`--danger-bg`, `--danger-text`, `--warn-bg`, `--warn-text`) in both light and dark modes. Red is the only hue permitted for error/warning states.

#### Scenario: Danger colors in light mode
- **WHEN** the system is in light mode
- **THEN** `--danger-bg` is a lightly red-tinted background
- **AND** `--danger-text` is a saturated red legible on that background
- **AND** `--warn-bg` equals `--danger-bg`
- **AND** `--warn-text` equals `--danger-text`

#### Scenario: Danger colors in dark mode
- **WHEN** the system is in dark mode
- **THEN** `--danger-bg` is a dark red-tinted background
- **AND** `--danger-text` is a bright red legible on dark backgrounds
- **AND** `--warn-bg` equals `--danger-bg`
- **AND** `--warn-text` equals `--danger-text`

## ADDED Requirements

### Requirement: Primary button text meets WCAG AA contrast in both themes
The system SHALL define a `--btn-text` CSS custom property that ensures a contrast ratio of at least 4.5:1 between primary button label text and button background (`--accent`) in both light and dark modes, as required by WCAG 2.1 SC 1.4.3 and RGAA 4.1 criterion 3.2.

#### Scenario: Primary button contrast in light mode
- **WHEN** the system is in light mode
- **THEN** primary button text (`--btn-text`) has a contrast ratio of at least 4.5:1 against `--accent` (`#333333`)

#### Scenario: Primary button contrast in dark mode
- **WHEN** the system is in dark mode
- **THEN** primary button text (`--btn-text`) has a contrast ratio of at least 4.5:1 against `--accent` (`#cccccc`)

#### Scenario: Primary button hover contrast in light mode
- **WHEN** the system is in light mode and the button is hovered
- **THEN** primary button text (`--btn-text`) has a contrast ratio of at least 4.5:1 against `--accent-strong` (`#111111`)

#### Scenario: Primary button hover contrast in dark mode
- **WHEN** the system is in dark mode and the button is hovered
- **THEN** primary button text (`--btn-text`) has a contrast ratio of at least 4.5:1 against `--accent-strong` (`#eeeeee`)
