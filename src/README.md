<!-- This README file is going to be the one displayed on the Grafana.com website for your plugin. Uncomment and replace the content here before publishing.

Remove any remaining comments before publishing as these may be displayed on Grafana.com -->

# Compass Panel

<!-- To help maximize the impact of your README and improve usability for users, we propose the following loose structure:

**BEFORE YOU BEGIN**
- Ensure all links are absolute URLs so that they will work when the README is displayed within Grafana and Grafana.com
- Be inspired ✨
  - [grafana-polystat-panel](https://github.com/grafana/grafana-polystat-panel)
  - [volkovlabs-variable-panel](https://github.com/volkovlabs/volkovlabs-variable-panel)

**ADD SOME BADGES**

Badges convey useful information at a glance for users whether in the Catalog or viewing the source code. You can use the generator on [Shields.io](https://shields.io/badges/dynamic-json-badge) together with the Grafana.com API
to create dynamic badges that update automatically when you publish a new version to the marketplace.

- For the URL parameter use `https://grafana.com/api/plugins/your-plugin-id`.
- Example queries:
  - Downloads: `$.downloads`
  - Catalog Version: `$.version`
  - Grafana Dependency: `$.grafanaDependency`
  - Signature Type: `$.versionSignatureType`
- Optionally, for the logo parameter use `grafana`.

Full example: ![Dynamic JSON Badge](https://img.shields.io/badge/dynamic/json?logo=grafana&query=$.version&url=https://grafana.com/api/plugins/grafana-polystat-panel&label=Marketplace&prefix=v&color=F47A20)

Consider other [badges](https://shields.io/badges) as you feel appropriate for your project.


## Overview / Introduction
Provide one or more paragraphs as an introduction to your plugin to help users understand why they should use it.

Consider including screenshots:
- in [plugin.json](https://grafana.com/developers/plugin-tools/reference/plugin-json#info) include them as relative links.
- in the README ensure they are absolute URLs.

## Requirements
List any requirements or dependencies they may need to run the plugin.

## Getting Started
Provide a quick start on how to configure and use the plugin.

## Documentation
If your project has dedicated documentation available for users, provide links here. For help in following Grafana's style recommendations for technical documentation, refer to our [Writer's Toolkit](https://grafana.com/docs/writers-toolkit/).

## Contributing
Do you want folks to contribute to the plugin or provide feedback through specific means? If so, tell them how!
-->

![Dynamic JSON Badge](https://img.shields.io/badge/dynamic/json?logo=grafana&query=$.version&url=https://grafana.com/api/plugins/grafana-compass-panel&label=Marketplace&prefix=v&color=F47A20)
[![License](https://img.shields.io/github/license/OceanDataTools/grafana-compass-panel)](LICENSE)

## Overview / Introduction
**Compass** is a Grafana visualization plugin for displaying heading or orientation data on a compass dial.  
It is especially useful for ship navigation, robotics, UAVs, or any time-series data representing direction in degrees (0–360).

![Compass Example](https://raw.githubusercontent.com/OceanDataTools/grafana-compass-panel/main/src/screenshots/compass-with-needle.png)

---

## Features

- Smoothly animated compass dial that rotates with heading values.
- Multiple **needle types**:
  - **Default**: classic north/south needle with red tip.
  - **Arrow**: bold arrow-style needle.
  - **Ship**: minimal ship silhouette pointing forward.
  - **Custom SVG**: load your own vector as a needle.
  - **Custom PNG**: load your own bitmap as a needle.
- Optional numeric heading readout (e.g. `273°`).
- Cardinal direction labels (N/E/S/W).
- Configurable colors for bezel, dial, text, needle, and tail.
- Minor and major tick marks for easy orientation.

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

### Display Options
- **Show Labels**: Toggle cardinal direction labels (N/E/S/W).
- **Show Numeric Heading**: Display a numeric degree readout below the compass.

### Needle Options
- **Needle Type**  
  - `Default` – red-tipped classic compass needle  
  - `Arrow` – stylized arrow needle  
  - `Ship` – simplified vessel silhouette (points to heading)  
  - `SVG` – load a custom vector (provide URL or relative path)  
  - `PNG` – load a custom image (provide URL or relative path)

- **Needle Color**: Color of the primary needle.  
- **Tail Color**: Color of the tail (for default needle).  
- **Custom SVG**: Path/URL to your own SVG asset.  
- **Custom PNG**: Path/URL to your own PNG asset.  

### Colors
- **Dial Color** – background of compass dial.  
- **Bezel Color** – outer rim.  
- **Text Color** – labels, ticks, numeric heading.  

---

## Screenshots
![Arrow Needle](https://raw.githubusercontent.com/OceanDataTools/grafana-compass-panel/main/src/screenshots/compass-with-arrow.png)

*Arrow needle with labels and numeric heading enabled*

![Ship Needle](https://raw.githubusercontent.com/OceanDataTools/grafana-compass-panel/main/src/screenshots/compass-with-ship-profile.png)
*Ship silhouette needle for vessel heading visualization*

![Custom Styling](https://raw.githubusercontent.com/OceanDataTools/grafana-compass-panel/main/src/screenshots/compass-with-custom-styling.png)
*Standard needle compass with custom styling*
