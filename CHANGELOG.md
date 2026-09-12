# Changelog

All notable user-facing changes to this plugin are documented here, organized
by release and change type (`Added` / `Fixed` / `Changed` / `Breaking`).

**Policy:** purely internal changes with no effect on the plugin's behavior or
requirements (dependency bumps, CI/build tooling, scaffold syncs) are not
listed individually here, unless they change something a user would notice
or need to act on — e.g. a new minimum supported Grafana version.

## Unreleased

### Added

- Configurable animation duration for needle/dial/wind-arrow rotations (default
  600ms, 0 disables animation), for high-frequency live data sources such as
  Grafana Live streams updating tens of times per second. (#10)
- Five new built-in needle shapes: Airplane, Helicopter, Underwater Drone,
  Quadcopter, and ROV. (#17, #28)

### Fixed

- The needle and numeric readouts (heading, true/apparent wind direction, wind
  speed) no longer disappear or incorrectly show "No data" when the actual
  value is exactly 0° or 0 speed. (#11)
- The true/apparent wind arrow no longer renders an invalid `rotate(null)`
  transform (logged as a console error on every render) when a wind
  direction field is configured but its current value is null. (#21)

### Changed

- Clarified that the "Apparent wind Direction Field" option must be the wind
  angle relative to the ship's bow (as read directly off a wind vane), not an
  absolute compass bearing — documentation only, no behavior change. (#9)
- Upgraded the Grafana SDK packages (`@grafana/data`, `@grafana/runtime`,
  `@grafana/schema`, `@grafana/ui`, `@grafana/i18n`) to 13.1.5, and updated
  `plugin.json`'s `grafanaDependency` accordingly (now requires a patch
  version that supports externalizing the JSX runtime:
  `>=12.0.10 <12.1 || >=12.1.7 <12.2 || >=12.2.5`). (#12)

## 2.1.3 - 2026-01-04

### Fixed

- Apparent wind direction is now correctly calculated relative to the vessel's
  heading, not the fixed compass dial. (#7)

## 2.1.2 - 2025-11-05

### Added

- Biased the custom PNG needle image so it's easier to tell which end points
  forward.

### Fixed

- Improved "No data" handling across the panel.

## 2.1.1 - 2025-10-27

### Fixed

- Corrected the plugin's license declaration and version numbers.

### Changed

- Fixed broken links across the README files, including the Grafana
  Marketplace listing.

## 2.1.0 - 2025-10-15

### Added

- Optional numeric velocity (speed) labels for true and apparent wind, with a
  configurable unit of measure (kts / m/s / mph / kph). (#4)

## 2.0.0 - 2025-09-10

### Breaking

- Combined the separate Windrose and Compass panels into a single unified
  panel. Existing Windrose-only or Compass-only dashboards need to be
  reconfigured against the new combined panel.

### Added

- Optional true and apparent wind direction indicators on the compass dial.

## 1.0.0 - 2025-09-08

Initial release.

### Added

- Compass dial rendering heading data, with a choice of needle styles.
- Rotation mode option: rotate the needle (north-up) or rotate the dial
  (bow-up). (#1)
