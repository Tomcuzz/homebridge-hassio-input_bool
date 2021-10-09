var mqtt = require('mqtt');

let Service, Characteristic;

module.exports = (api) => {
  api.registerAccessory('HassInputBool', HassInputBool);
};

class HassInputBool{
	constructor(log, config, api) {
		this.log = log;
		this.config = config;
		this.api = api;

		this.name = config.name || 'hass-input-bool';
		this.current_value = "";
		this.on_value = config.on_value || "ON";
		this.off_value = config.off_value || "OFF";

		this.mqtt_url = config.mqtt.url || '';
		this.mqtt_clientid = config.mqtt.clientid || this.createClientId();
		this.mqtt_username = config.mqtt.username || 'hass-input-bool';
		this.mqtt_password = config.mqtt.password || 'password';
		this.mqtt_topic = config.mqtt.topic || 'hass-input-bool';
		this.mqtt_will_topic = config.mqtt.will || 'hass-input-bool-will';
		this.mqtt_options = {
			keepalive: 10,
			clientId: this.mqtt_clientId,
			protocolId: 'MQTT',
			protocolVersion: 4,
			clean: true,
			reconnectPeriod: 1000,
			connectTimeout: 30000,
			will: {
				topic: this.mqtt_will_topic,
				payload: this.mqtt_clientid + " - Disconnected",
				qos: 0,
				retain: false
			},
			username: this.mqtt_username,
			password: this.mqtt_password,
			rejectUnauthorized: false
		};

		this.setupMQTT();
		this.setupHapServices();
	}

	getServices() {
		return [this.Switch];
	}

	setupHapServices() {
		this.Service = this.api.hap.Service;
      		this.Characteristic = this.api.hap.Characteristic;
		this.addSwitch(this.name);
	}

	addSwitch(name) {
		this.log("Adding switch " + name);
		this.Switch = new this.Service.Switch(name, name);
		this.Switch
			.getCharacteristic(this.Characteristic.On)
			.onGet(this.handleOnGet.bind(this))
			.onSet(this.handleOnSet.bind(this));
	}

	handleOnGet() {
		if (this.on_value == this.current_value) {
			return 1;
		} else {
			return 0;
		}
	}

	handleOnSet(value) {
		this.log(this.name + " Was set to " + value);
		if (value) {
			this.mqtt_client.publish(this.mqtt_topic, this.on_value);
			this.current_value = this.on_value;
		} else {
			this.mqtt_client.publish(this.mqtt_topic, this.off_value);
			this.current_value = this.off_value;
		}
		this.updateSwitch()
	}

	updateSwitch() {
		if (this.current_value == this.on_value) {
			this.Switch.getCharacteristic(this.Characteristic.On).updateValue(true);
		} else {
			this.Switch.getCharacteristic(this.Characteristic.On).updateValue(false);
		}
	}

	createClientId() {
		return 'hass-input-bool' +
			this.name.replace(/[^\x20-\x7F]/g, "") + '_' +
			Math.random().toString(16).substr(2, 8);
	}

	setupMQTT() {
		this.log("Setting up MQTT connetion to: " + this.mqtt_url)
                this.mqtt_client = mqtt.connect(this.mqtt_url, this.mqtt_options)
		this.mqtt_client.on('connect', this.handleMqttConnected.bind(this));
		this.mqtt_client.on('message', this.handleMqttMessage.bind(this));
                this.mqtt_client.on('error', this.handleMqttError.bind(this));
        }

	handleMqttError(err) {
		this.log('MQTT Error: ' + err);
	}

	handleMqttConnected() {
		this.log('MQTT Connected');
		this.log('MQTT Subscribing to ' + this.mqtt_topic)
		this.mqtt_client.subscribe(this.mqtt_topic, function (err) {
			if (err) {
				this.log('MQTT Sensor Subscription error:' + err);
			} else {
				this.log('MQTT Subscribed');
			}
		}.bind(this));
	}

	handleMqttMessage(topic, message) {
		this.log("MQTT receieved, Topic: " + topic + " message: " + message);
		if (topic == this.mqtt_topic) {
			if (message == this.on_value || message == this.off_value) {
				this.current_value = message;
				this.updateSwitch();
			} else {
				this.log("MQTT Message error, Topic: " + topic + " message: " + message + ", Un-regognised value")
			}
		} else {
			this.log('MQTT Message error topic: ' + topic + ' message: ' + message);
		}
	}
}
