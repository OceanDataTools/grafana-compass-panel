# Compass Panel

[![Grafana Marketplace](https://img.shields.io/badge/dynamic/json?logo=grafana&query=$.version&url=https://grafana.com/api/plugins/oceandatatools-compass-panel&label=Marketplace&prefix=v&color=F47A20)](https://grafana.com/grafana/plugins/oceandatatools-compass-panel/)
[![GitHub Sponsor](https://img.shields.io/github/sponsors/webbpinner?label=Sponsor&logo=GitHub)](https://github.com/sponsors/webbpinner)
[![License](https://img.shields.io/github/license/OceanDataTools/grafana-compass-panel)](LICENSE)

## Overview / Introduction

**Compass** is a Grafana visualization plugin for displaying heading or orientation data on a compass dial.  
It is especially useful for ship navigation, robotics, UAVs, or any time-series data representing direction in degrees (0–360).
Optionally the panel can display true and/or apparent wind angle.

![Compass with Wind Indicators Example](https://raw.githubusercontent.com/OceanDataTools/grafana-compass-panel/main/src/screenshots/wind-with-spd.png)

---

## Features

- Smoothly animated compass dial that rotates with heading values.
- Multiple **needle types**:
  - **Default**: classic north/south needle with red tip.
  - **Arrow**: bold arrow-style needle.
  - **Ship**: minimal ship silhouette pointing forward.
  - **Airplane**: swept-wing top-down aircraft silhouette.
  - **Helicopter**: rotor disk, fuselage, and tail rotor.
  - **Underwater Drone**: torpedo-shaped ROV/AUV body with a tail fin cluster.
  - **Quadcopter**: four-arm drone frame with a distinctly colored front rotor.
  - **Custom SVG**: load your own vector as a needle.
  - **Custom PNG**: load your own bitmap as a needle.
- Cardinal direction labels (N/E/S/W).
- Configurable colors for bezel, dial, text, needle, and tail.
- Minor and major tick marks for easy orientation.
- Optional numeric heading readout (e.g. `273°`).
- Optional indicator and numeric heading for true wind direction.
- Optional indicator and numeric heading for apparent wind direction.
- Optional numeric display for true wind speed.
- Optional numeric display for apparent wind speed.

---

## Getting Started

1. Install the plugin by copying it into Grafana’s plugin directory or installing from the Grafana Marketplace.
2. Restart Grafana.
3. Add a new panel and select **Compass** as the visualization.
4. Configure the data source and select the field representing **heading** (0–360 degrees).

---

## Options

### Data Options

- **Heading Field**: Select the numeric field in your series that represents heading in degrees.
- **Truewind Direction Field**: Select the numeric field in your series that represents true wind direction, as an **absolute compass bearing** (0-360°, independent of the ship's heading).
- **Truewind Velocity Field**: Select the numeric field in your series that represents truewind velocity in degrees.
- **Apparent wind Direction Field**: Select the numeric field in your series that represents apparent wind angle, **relative to the ship's bow** (0-360°, as read directly off a wind vane/anemometer). This is *not* an absolute compass bearing — a rotational wind sensor can only measure angle relative to the bow it's mounted on, so the panel combines it with the Heading Field to compute the wind's true position on the compass. If your data source already outputs an absolute apparent wind direction (e.g. some chartplotters/NMEA multiplexers compute this for you), subtract the heading from it upstream to get a bow-relative angle before wiring it in here.
- **Apparent wind Velocity Field**: Select the numeric field in your series that represents apparent wind velocity in degrees.

### Display Options

- **Show Labels**: Toggle cardinal direction labels (N/E/S/W).
- **Show Numeric Heading**: Display a numeric degree readout below the compass.
- **Truewind Velocity UOM**: Select the unit of measure for the truewind.
- **Apparent wind Velocity UOM**: Select the unit of measure for the apparent wind.
- **Rotation Mode**: Select to rotate the needle (North up) or rotate the dial (Bow up).
- **Animation Duration (ms)**: How long needle/dial/wind-arrow rotations take to animate (default 600ms). Lower this, or set it to 0 to disable animation, for high-frequency live data (e.g. Grafana Live streams updating tens of times per second) where the default speed lags behind incoming updates.

### Needle Options

- **Needle Type**

  - `Default` – Red-tipped classic compass needle
  - `Arrow` – Stylized arrow needle
  - `Ship` – Simplified vessel silhouette (points to heading)
  - `Airplane` – Top-down aircraft silhouette (points to heading)
  - `Helicopter` – Rotor disk, fuselage, and tail rotor (points to heading)
  - `Underwater Drone` – Torpedo-shaped ROV/AUV silhouette with tail fins (points to heading)
  - `Quadcopter` – Four-arm drone frame; the front rotor is drawn in the Needle Color, the other three in the Tail Color (points to heading)
  - `SVG` – Load a custom vector (provide URL or relative path)
  - `PNG` – Load a custom image (provide URL or relative path)

- **Needle Color**: Color of the primary needle (or the front rotor, for the quadcopter).
- **Tail Color**: Color of the tail (for the default needle), the non-front rotors (quadcopter), or the tail fins (underwater drone).
- **Custom SVG**: Path/URL to your own SVG asset.
- **Custom PNG**: Path/URL to your own PNG asset.

### Colors

- **Dial Color** – Background color of compass dial.
- **Bezel Color** – Color of outer rim.
- **Text Color** – Color of labels, ticks, numeric heading.
- **True Wind Color**: Color of the true wind indicator and labels.
- **Apparent Wind Color**: Color of the apparent wind indicator and labels.

---

## Screenshots

![Default Needle](https://raw.githubusercontent.com/OceanDataTools/grafana-compass-panel/main/src/screenshots/compass-with-needle.png)

_Arrow needle with labels and numeric heading enabled_

![Arrow Needle](https://raw.githubusercontent.com/OceanDataTools/grafana-compass-panel/main/src/screenshots/compass-with-arrow.png)

_Arrow needle with labels and numeric heading enabled_

![Ship Needle](https://raw.githubusercontent.com/OceanDataTools/grafana-compass-panel/main/src/screenshots/compass-with-ship-profile.png)

_Ship silhouette needle for vessel heading visualization_

![Airplane Needle](https://raw.githubusercontent.com/OceanDataTools/grafana-compass-panel/main/src/screenshots/compass-with-airplane.png)

_Airplane needle for aircraft heading visualization_

![Helicopter Needle](https://raw.githubusercontent.com/OceanDataTools/grafana-compass-panel/main/src/screenshots/compass-with-helicopter.png)

_Helicopter needle for rotorcraft heading visualization_

![Underwater Drone Needle](https://raw.githubusercontent.com/OceanDataTools/grafana-compass-panel/main/src/screenshots/compass-with-underwater-drone.png)

_Underwater drone needle for ROV/AUV heading visualization_

![Quadcopter Needle](https://raw.githubusercontent.com/OceanDataTools/grafana-compass-panel/main/src/screenshots/compass-with-quadcopter.png)

_Quadcopter needle, front rotor highlighted, for drone heading visualization_

![Custom Styling](https://raw.githubusercontent.com/OceanDataTools/grafana-compass-panel/main/src/screenshots/compass-with-custom-styling.png)

_Standard needle compass with custom styling_

![North Up Orientation](https://raw.githubusercontent.com/OceanDataTools/grafana-compass-panel/main/src/screenshots/wind-with-spd.png)

_North up orientation for wind indicator visualization_

![Bow Up Orientation](https://raw.githubusercontent.com/OceanDataTools/grafana-compass-panel/main/src/screenshots/wind-without-spd.png)

_Bow up orientation for wind indicator visualization_
