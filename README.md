# homebridge-hassio-input_bool
A simple package to bridge mqtt input_bool's from Home Assistant to Homekit using HomeBridge

   * [Installation](#installation)
   * [Configuration](#configuration)
   * [Release Notes](#release-notes)

# Installation
Follow the instructions in [homebridge](https://www.npmjs.com/package/homebridge) for the homebridge server installation.
This plugin is published through [NPM](https://www.npmjs.com/package/homebridge-hassio-input_bool) and should be installed "globally" by typing:

    npm install -g homebridge-hassio-input_bool

# Configuration
An example configuration for HomeBridge is below:

```javascript
{
  "accessory": "HassInputBool",
  "name": "Visitor Mode",
  "mqtt": {
    "url":"mqtt://192.168.1.2:1883",
    "topic":"hass-homebridge/visitor-mode"
  }
}
```

And the following is an example Home Assistant config extract:
```yaml
input_bool:
  visitor_mode:
    name: "Visitor Mode"

automation:
  - alias: Visitor Mode Mqtt Publish
    trigger:
        platform: state
        entity_id: input_boolean.visitor_mode
    action:
        - service: mqtt.publish
          data_template:
              topic: "hass-homebridge/visitor-mode"
              payload: '{{ states.input_boolean.visitor_mode.state }}'

  - alias: Visitor Mode On Mqtt Subscribe
    trigger:
        platform: mqtt
        topic: "hass-homebridge/visitor-mode"
        payload: "on"
    action:
        - service: input_boolean.turn_on
          target:
              entity_id: input_boolean.visitor_mode

  - alias: Visitor Mode Off Mqtt Subscribe
    trigger:
        platform: mqtt
        topic: "hass-homebridge/visitor-mode"
        payload: "off"
    action:
        - service: input_boolean.turn_off
          target:
              entity_id: input_boolean.visitor_mode
```

# Release Notes
## Roadmap:
- Fully Test
- Write Tests
