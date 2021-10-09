# homebridge-hassio-input_bool
A simple package to bridge mqtt input_bool's from Home Assistant to Homekit using HomeBridge

   * [Installation](#installation)
   * [Configuration](#configuration)
   * [Release Notes](#release-notes)

# Installation
Follow the instructions in [homebridge](https://www.npmjs.com/package/homebridge) for the homebridge server installation.
This plugin is published through [NPM](https://www.npmjs.com/package/homebridge-hassio-input_bool) and should be installed "globally" by typing:

    npm install -g homebridge-tasmota-sonoff-thermostat

# Configuration
An example configuration for HomeBridge is below:

```javascript
{
  "accessory": "HassInputSelect",
  "name": "Hass Input Select",
  "values": [
    "Morning",
    "Day",
    "Night"
  ],
  "mqtt": {
    "url": "mqtt://192.168.1.2:1883",
    "clientid": "clinetid",
    "username": "username",
    "password": "password",
    "topic": "publish/topic/in/mqtt"
  }
}
```

And the following is an example Home Assistant config extract:
```yaml
input_bool:
  home_state:
    name: Current Home State
    options:
      - Morning
      - Day
      - Night

automation:
  - alias: Home Select Mqtt Publish
    trigger:
        platform: state
        entity_id: input_bool.home_state
    action:
        - service: mqtt.publish
          data_template:
              topic: "hass-homebridge/home-state"
              payload: '{{ states.input_bool.home_state.state }}'

  - alias: Home Select Mqtt Subscribe
    trigger:
        platform: mqtt
        topic: "hass-homebridge/home-state"
    action:
        - service: input_bool.select_option
          target:
              entity_id: input_bool.home_state
          data:
              option: "{{ trigger.payload }}
```

# Release Notes
## Roadmap:
- Fully Test
- Write Tests
