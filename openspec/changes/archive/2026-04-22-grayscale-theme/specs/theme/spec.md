## ADDED Requirements

### Requirement: Light theme uses grayscale base colors
The light theme SHALL use neutral gray tones for backgrounds, surfaces, text, and borders. No tinted or chromatic hues are permitted for structural colors.

#### Scenario: Light theme background and surface
- **WHEN** the system is in light mode
- **THEN** `--bg` is a soft off-white gray (not pure white, not tinted)
- **AND** `--surface` is white
- **AND** `--border` is a mid-gray

#### Scenario: Light theme text colors
- **WHEN** the system is in light mode
- **THEN** `--text` is near-black
- **AND** `--text-soft` is a medium gray

#### Scenario: Light theme interactive accent
- **WHEN** the system is in light mode
- **THEN** `--accent` and `--accent-strong` are dark grays (no hue)

### Requirement: Dark theme uses grayscale base colors
The dark theme SHALL use dark charcoal backgrounds (not pure black) and light gray text, with neutral gray borders and interactive accents.

#### Scenario: Dark theme background and surface
- **WHEN** the system is in dark mode
- **THEN** `--bg` is a dark charcoal (not #000000)
- **AND** `--surface` is slightly lighter than `--bg`
- **AND** `--border` is a subtle dark gray

#### Scenario: Dark theme text colors
- **WHEN** the system is in dark mode
- **THEN** `--text` is light gray (not pure white)
- **AND** `--text-soft` is a mid gray

#### Scenario: Dark theme interactive accent
- **WHEN** the system is in dark mode
- **THEN** `--accent` and `--accent-strong` are light grays (no hue)

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

### Requirement: Success states use green
The system SHALL use green (`--ok-bg`, `--ok-text`) in both light and dark modes. Green is the only hue permitted for success states.

#### Scenario: Success colors in light mode
- **WHEN** the system is in light mode
- **THEN** `--ok-bg` is a lightly green-tinted background
- **AND** `--ok-text` is a saturated green legible on that background

#### Scenario: Success colors in dark mode
- **WHEN** the system is in dark mode
- **THEN** `--ok-bg` is a dark green-tinted background
- **AND** `--ok-text` is a bright green legible on dark backgrounds
